from decimal import Decimal

from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)
from models.venda import Venda, ItemVenda
from models.produto import Produto
from models.despesa import Despesa
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db

from models.usuario import Usuario
from models.caixa import Caixa, MovimentoCaixa

from schemas.caixa import (
    RecolherCaixa,
    RetirarCaixa
)

from services.calculo_caixa import calcular_saldo_caixa


router = APIRouter(
    prefix="/caixa",
    tags=["Caixa"]
)



# =====================================================
# MINHA CAIXA
# =====================================================

@router.get("/minha/{usuario_id}")
async def minha_caixa(
    usuario_id: int,
    db: AsyncSession = Depends(get_db)
):

    resultado = await db.execute(
        select(Usuario)
        .where(
            Usuario.id == usuario_id
        )
    )

    usuario = resultado.scalar_one_or_none()


    if not usuario:
        raise HTTPException(
            404,
            "Usuário não encontrado"
        )


    dados = await calcular_saldo_caixa(
        db,
        usuario_id
    )



    resultado = await db.execute(

        select(MovimentoCaixa)

        .join(Caixa)

        .where(
            Caixa.usuario_id == usuario_id
        )

        .order_by(
            MovimentoCaixa.data_movimento.desc()
        )

    )


    movimentos = resultado.scalars().all()



    return {

        "usuario_id": usuario.id,

        "nome": usuario.nome,

        "tipo": usuario.tipo,


        "vendas": float(
            dados.get(
                "vendas",
                0
            )
        ),


        "despesas": float(
            dados.get(
                "despesas",
                0
            )
        ),


        "retirado": float(
            dados.get(
                "retirado",
                0
            )
        ),


        "saldo_atual": float(
            dados.get(
                "saldo_caixa",
                0
            )
        ),


        "movimentos": [

            {

                "tipo": item.tipo,

                "descricao": item.descricao,

                "valor": float(
                    item.valor
                ),

                "data": item.data_movimento,

                "observacao": item.observacao

            }

            for item in movimentos

        ]

    }





# =====================================================
# TODAS AS CAIXAS
# ADMIN / GERENTE
# =====================================================

@router.get("/todas")
async def todas_caixas(
    usuario_id: int,
    db: AsyncSession = Depends(get_db)
):

    resultado = await db.execute(
        select(Usuario)
        .where(
            Usuario.id == usuario_id
        )
    )


    admin = resultado.scalar_one_or_none()



    if not admin:

        raise HTTPException(
            404,
            "Usuário não encontrado"
        )



    if admin.tipo not in [
        "admin",
        "gerente"
    ]:

        raise HTTPException(
            403,
            "Sem permissão"
        )



    resultado = await db.execute(
        select(Usuario)
    )


    usuarios = resultado.scalars().all()



    lista = []



    for usuario in usuarios:


        dados = await calcular_saldo_caixa(
            db,
            usuario.id
        )



        lista.append({

            "usuario_id": usuario.id,

            "nome": usuario.nome,

            "tipo": usuario.tipo,


            "vendas": float(
                dados.get(
                    "vendas",
                    0
                )
            ),


            "despesas": float(
                dados.get(
                    "despesas",
                    0
                )
            ),


            "retirado": float(
                dados.get(
                    "retirado",
                    0
                )
            ),


            "saldo": float(
                dados.get(
                    "saldo_caixa",
                    0
                )
            )

        })



    return lista





# =====================================================
# RECOLHER DINHEIRO DO VENDEDOR
# ADMIN / GERENTE
# =====================================================

@router.post("/recolher")
async def recolher_caixa(
    dados: RecolherCaixa,
    usuario_id: int,
    db: AsyncSession = Depends(get_db)
):

    # =====================================================
    # BUSCAR RESPONSÁVEL
    # =====================================================

    resultado = await db.execute(
        select(Usuario)
        .where(
            Usuario.id == usuario_id
        )
    )

    responsavel = resultado.scalar_one_or_none()

    if not responsavel:

        raise HTTPException(
            status_code=404,
            detail="Usuário não encontrado"
        )


    # =====================================================
    # SOMENTE ADMIN / GERENTE
    # =====================================================

    if responsavel.tipo not in [
        "admin",
        "gerente"
    ]:

        raise HTTPException(
            status_code=403,
            detail="Sem permissão"
        )


    # =====================================================
    # BUSCAR CAIXA DO VENDEDOR
    # =====================================================

    resultado = await db.execute(
        select(Caixa)
        .where(
            Caixa.usuario_id == dados.vendedor_id
        )
    )

    caixa = resultado.scalar_one_or_none()


    # =====================================================
    # CRIAR CAIXA SE NÃO EXISTIR
    # =====================================================

    if not caixa:

        caixa = Caixa(
            usuario_id=dados.vendedor_id,
            saldo=Decimal("0.00")
        )

        db.add(caixa)

        await db.flush()


    # =====================================================
    # CALCULAR SALDO ATUAL
    # =====================================================

    saldo = await calcular_saldo_caixa(
        db,
        dados.vendedor_id
    )

    saldo_atual = Decimal(
        str(
            saldo["saldo_caixa"]
        )
    )


    # =====================================================
    # NÃO BLOQUEAR RECOLHA POR SALDO INSUFICIENTE
    #
    # A recolha continua sendo registrada.
    #
    # Se o vendedor tiver saldo:
    #     segue normalmente.
    #
    # Se não tiver saldo:
    #     também registra a recolha.
    #
    # O saldo poderá ficar negativo.
    # =====================================================


    # =====================================================
    # NOVO SALDO
    # =====================================================

    novo_saldo = (
        saldo_atual
        - dados.valor
    )


    # =====================================================
    # REGISTRAR RECOLHA
    # =====================================================

    movimento = MovimentoCaixa(

        caixa_id=caixa.id,

        tipo="RECOLHA",

        descricao="Entrega ao gerente/admin",

        valor=dados.valor,

        saldo_anterior=saldo_atual,

        saldo_depois=novo_saldo,

        responsavel_id=responsavel.id,

        observacao=dados.observacao

    )


    db.add(movimento)

    await db.commit()


    # =====================================================
    # RESPOSTA
    # =====================================================

    return {

        "mensagem":
            "Recolha realizada",

        "saldo_anterior":
            float(
                saldo_atual
            ),

        "valor_recolhido":
            float(
                dados.valor
            ),

        "novo_saldo":
            float(
                novo_saldo
            )

    }

# =====================================================
# RETIRAR DA PRÓPRIA CAIXA
# ADMIN / GERENTE
# =====================================================

@router.post("/retirar")
async def retirar_caixa(
    dados: RetirarCaixa,
    usuario_id: int,
    db: AsyncSession = Depends(get_db)
):

    resultado = await db.execute(
        select(Usuario)
        .where(
            Usuario.id == usuario_id
        )
    )


    usuario = resultado.scalar_one_or_none()



    if not usuario:

        raise HTTPException(
            404,
            "Usuário não encontrado"
        )



    resultado = await db.execute(
        select(Caixa)
        .where(
            Caixa.usuario_id == usuario_id
        )
    )


    caixa = resultado.scalar_one_or_none()



    if not caixa:

        caixa = Caixa(
            usuario_id=usuario_id,
            saldo=Decimal("0.00")
        )

        db.add(caixa)

        await db.flush()



    saldo = await calcular_saldo_caixa(
        db,
        usuario_id
    )



    saldo_atual = Decimal(
        str(
            saldo["saldo_caixa"]
        )
    )



    if dados.valor > saldo_atual:

        raise HTTPException(
            400,
            "Valor maior que saldo disponível"
        )



    movimento = MovimentoCaixa(

        caixa_id=caixa.id,

        tipo="RETIRADA",

        descricao="Retirada da própria caixa",

        valor=dados.valor,

        saldo_anterior=saldo_atual,

        saldo_depois=
            saldo_atual - dados.valor,

        responsavel_id=usuario.id,

        observacao=dados.observacao

    )



    db.add(movimento)


    await db.commit()



    return {

        "mensagem":
            "Retirada realizada",

        "novo_saldo":
            float(
                saldo_atual - dados.valor
            )

    }


# =====================================================
# HISTÓRICO GERAL
# ADMIN / GERENTE
# =====================================================

@router.get("/historico")
async def historico_geral(
    usuario_id: int,
    db: AsyncSession = Depends(get_db)
):

    # verificar permissão

    resultado = await db.execute(
        select(Usuario)
        .where(
            Usuario.id == usuario_id
        )
    )

    usuario = resultado.scalar_one_or_none()


    if not usuario:
        raise HTTPException(
            404,
            "Usuário não encontrado"
        )


    if usuario.tipo not in [
        "admin",
        "gerente"
    ]:
        raise HTTPException(
            403,
            "Sem permissão"
        )


    historico = []


    # =====================================
    # MOVIMENTOS DE CAIXA
    # =====================================

    resultado = await db.execute(

        select(
            MovimentoCaixa,
            Usuario.nome
        )

        .join(
            Caixa,
            MovimentoCaixa.caixa_id == Caixa.id
        )

        .join(
            Usuario,
            Caixa.usuario_id == Usuario.id
        )

        .order_by(
            MovimentoCaixa.data_movimento.desc()
        )

    )


    for movimento, nome in resultado.all():

        historico.append({

            "nome": nome,

            "tipo": movimento.tipo,

            "valor": float(
                movimento.valor
            ),

            "data": movimento.data_movimento,

            "observacao":
                movimento.observacao or ""

        })


    # =====================================
    # VENDAS
    # =====================================

    resultado = await db.execute(

        select(Venda)

        .options(

            selectinload(
                Venda.usuario
            ),

            selectinload(
                Venda.itens
            )
            .selectinload(
                ItemVenda.produto
            )

        )

        .order_by(
            Venda.data_venda.desc()
        )

    )


    vendas = resultado.scalars().all()


    for venda in vendas:


        produtos = []


        for item in venda.itens:

            produtos.append(
                f"{item.quantidade} {item.produto.nome}"
            )


        historico.append({

            "nome":
                venda.usuario.nome,

            "tipo":
                "VENDA",

            "valor":
                float(venda.total),

            "data":
                venda.data_venda,

            "observacao":
                ", ".join(produtos)

        })


    # =====================================
    # DESPESAS APROVADAS
    # =====================================

    resultado = await db.execute(


        select(
            Despesa,
            Usuario.nome
        )

        .join(
            Usuario,
            Despesa.usuario_id == Usuario.id
        )

        .where(
            Despesa.estado == "aprovado"
        )

        .order_by(
            Despesa.data_despesa.desc()
        )


    )

    despesas = resultado.all()

    for despesa, nome_usuario in despesas:


            historico.append({

                "nome":
                    nome_usuario,

                "tipo":
                    "DESPESA",

                "valor":
                    float(
                        despesa.valor_aprovado
                        or 0
                    ),

                "data":
                    despesa.data_despesa,

                "observacao":
                    despesa.descricao

            })


    # ordenar tudo por data

    historico.sort(
        key=lambda x: x["data"],
        reverse=True
    )

    return historico


@router.get("/dashboard/vendas-dia")
async def vendas_dia(
    usuario_id: int | None = None,
    db: AsyncSession = Depends(get_db)
):

    hoje = datetime.now().date()

    # =====================================
    # BUSCAR USUÁRIO
    # =====================================

    usuario = None

    if usuario_id is not None:

        resultado = await db.execute(
            select(Usuario)
            .where(
                Usuario.id == usuario_id
            )
        )

        usuario = resultado.scalar_one_or_none()

        if not usuario:

            raise HTTPException(
                status_code=404,
                detail="Usuário não encontrado"
            )

    # =====================================
    # BUSCAR TODAS AS VENDAS
    # =====================================

    consulta = select(Venda).order_by(
        Venda.data_venda.desc()
    )

    # =====================================
    # FILTRAR VENDEDOR
    # =====================================

    if (
        usuario is not None
        and usuario.tipo == "vendedor"
    ):

        consulta = consulta.where(
            Venda.usuario_id == usuario.id
        )

    resultado = await db.execute(
        consulta
    )

    vendas = resultado.scalars().all()

    print("=====================================")
    print(" VENDAS ENCONTRADAS:", len(vendas))
    print(" HOJE:", hoje)
    print("=====================================")

    total = Decimal("0.00")

    for venda in vendas:

        print(
            "VENDA:",
            venda.id,
            "USUARIO:",
            venda.usuario_id,
            "TOTAL:",
            venda.total,
            "DATA:",
            venda.data_venda
        )

        if venda.data_venda:

            data_venda = venda.data_venda

            if hasattr(data_venda, "date"):

                data_venda = data_venda.date()

            if data_venda == hoje:

                total += Decimal(
                    str(venda.total or 0)
                )

    print("=====================================")
    print("TOTAL VENDAS HOJE:", total)
    print("=====================================")

    return {
        "vendas_dia": float(total)
    }
