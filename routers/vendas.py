from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from datetime import datetime, timedelta
from database import get_db
from models.usuario import Usuario
from models.venda import Venda, ItemVenda
from models.produto import Produto

from schemas.venda import VendaCreate, VendaResponse

router = APIRouter(
    prefix="/vendas",
    tags=["Vendas"]
)


@router.post(
    "/",
    response_model=VendaResponse
)
async def criar_venda(
    dados: VendaCreate,
    db: AsyncSession = Depends(get_db)
):

    total = 0
    itens_db = []

    # Verifica produtos e calcula total
    for item in dados.itens:

        resultado = await db.execute(
            select(Produto).where(
                Produto.id == item.produto_id
            )
        )

        produto = resultado.scalar_one_or_none()

        if produto is None:
            raise HTTPException(
                status_code=404,
                detail="Produto não encontrado"
            )

        if produto.quantidade < item.quantidade:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuficiente: {produto.nome}"
            )

        subtotal = produto.preco_venda * item.quantidade

        total += subtotal

        # Atualiza o stock
        produto.quantidade -= item.quantidade

        itens_db.append({
            "produto_id": produto.id,
            "quantidade": item.quantidade,
            "preco": produto.preco_venda,
            "subtotal": subtotal
        })

    troco = dados.valor_entregue - total

    if troco < 0:
        raise HTTPException(
            status_code=400,
            detail="Valor entregue insuficiente."
        )

    # Cria venda
    venda = Venda(
        usuario_id=dados.usuario_id,
        total=total,
        valor_entregue=dados.valor_entregue,
        troco=troco
    )

    db.add(venda)

    await db.flush()

    # Cria itens da venda
    for item in itens_db:

        db.add(
            ItemVenda(
                venda_id=venda.id,
                produto_id=item["produto_id"],
                quantidade=item["quantidade"],
                preco_unitario=item["preco"],
                subtotal=item["subtotal"]
            )
        )

    await db.commit()

    # Recarrega a venda já com os relacionamentos
    resultado = await db.execute(
        select(Venda)
        .options(
            selectinload(Venda.itens)
        )
        .where(Venda.id == venda.id)
    )

    venda = resultado.scalar_one()

    return venda

# =====================================================
# LISTAR VENDAS
# =====================================================

@router.get("/")
async def listar_vendas(
    db: AsyncSession = Depends(get_db)
):

    resultado = await db.execute(

        select(Venda)
        .options(
            selectinload(Venda.itens)
        )
        .order_by(
            Venda.id.desc()
        )

    )


    vendas = resultado.scalars().all()


    return vendas



# =====================================================
# BUSCAR UMA VENDA PELO ID
# =====================================================

@router.get("/{venda_id}")
async def buscar_venda(
    venda_id:int,
    db:AsyncSession = Depends(get_db)
):

    resultado = await db.execute(

        select(Venda)
        .options(
            selectinload(Venda.itens)
            .selectinload(ItemVenda.produto)
        )
        .where(
            Venda.id==venda_id
        )

    )


    venda = resultado.scalar_one_or_none()


    if venda is None:

        raise HTTPException(
            status_code=404,
            detail="Venda não encontrada"
        )


    return venda

# =====================================================
# DASHBOARD - VENDAS DO DIA
# =====================================================

@router.get("/dashboard/vendas-dia")
async def vendas_do_dia(
    usuario_id: int | None = None,
    db: AsyncSession = Depends(get_db)
):

    hoje = datetime.now().date()

    consulta = select(
        func.coalesce(func.sum(Venda.total), 0)
    ).where(
        func.date(Venda.data_venda) == hoje
    )

    if usuario_id is not None:
        consulta = consulta.where(
            Venda.usuario_id == int(usuario_id)
        )

    resultado = await db.execute(consulta)

    total = resultado.scalar()

    return {
        "vendas_dia": float(total)
    }

# =====================================================
# DASHBOARD - VENDAS POR VENDEDOR / DIA / PRODUTOS
# =====================================================


@router.get("/dashboard/vendas-vendedores")
async def vendas_por_vendedor(

    usuario_id:int,

    db:AsyncSession = Depends(get_db)

):


    usuario_resultado = await db.execute(

        select(Usuario)
        .where(
            Usuario.id == usuario_id
        )

    )


    usuario = usuario_resultado.scalar_one_or_none()


    if usuario is None:

        raise HTTPException(
            status_code=404,
            detail="Usuário não encontrado"
        )



    consulta = select(Venda).options(

        selectinload(Venda.usuario),

        selectinload(Venda.itens)
        .selectinload(ItemVenda.produto)

    )



    # vendedor vê só ele

    if usuario.tipo == "vendedor":

        consulta = consulta.where(

            Venda.usuario_id == usuario.id

        )



    # gerente vê vendedores

    elif usuario.tipo == "gerente":

        consulta = consulta.join(

            Usuario,

            Venda.usuario_id == Usuario.id

        ).where(

            Usuario.tipo == "vendedor"

        )



    # admin vê todos

    resultado = await db.execute(
        consulta.order_by(
            Venda.data_venda.desc()
        )
    )


    vendas = resultado.scalars().all()



    dados = {}



    for venda in vendas:


        nome = venda.usuario.nome

        data = venda.data_venda.strftime(
            "%d/%m/%Y"
        )



        chave = nome + "_" + data



        if chave not in dados:

            dados[chave] = {

                "vendedor": nome,

                "data": data,

                "total":0,

                "produtos":[]

            }



        dados[chave]["total"] += float(
            venda.total
        )



        for item in venda.itens:

            dados[chave]["produtos"].append({

                "produto": item.produto.nome,

                "quantidade": item.quantidade,

                "subtotal": float(
                    item.subtotal
                )

            })



    return list(dados.values())
