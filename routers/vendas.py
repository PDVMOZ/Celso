from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from datetime import datetime
from decimal import Decimal
from zoneinfo import ZoneInfo

from database import get_db

from models.usuario import Usuario
from models.venda import Venda, ItemVenda
from models.produto import Produto
from models.lote_produto import LoteProduto
from models.item_venda_lote import ItemVendaLote

from schemas.venda import VendaCreate, VendaResponse


router = APIRouter(
    prefix="/vendas",
    tags=["Vendas"]
)


# ==========================================================
# SINCRONIZAR PRODUTO COM O LOTE FIFO ATUAL
# ==========================================================

async def sincronizar_produto_com_lotes(
    produto: Produto,
    db: AsyncSession
):
    """
    Produto representa SOMENTE o primeiro lote disponível.

    Exemplo:

    Lote 1 -> 5 unidades -> preço 15
    Lote 2 -> 10 unidades -> preço 18

    Produto:
        quantidade = 5
        preco_venda = 15

    Quando Lote 1 chegar a zero:

    Produto:
        quantidade = 10
        preco_venda = 18

    Se não existir mais nenhum lote:

    Produto:
        quantidade = 0
    """

    resultado = await db.execute(
        select(LoteProduto)
        .where(
            LoteProduto.produto_id == produto.id,
            LoteProduto.quantidade_atual > 0
        )
        .order_by(
            LoteProduto.id.asc()
        )
        .limit(1)
    )

    lote_atual = resultado.scalar_one_or_none()

    # ------------------------------------------------------
    # NÃO EXISTE LOTE DISPONÍVEL
    # ------------------------------------------------------

    if lote_atual is None:

        produto.quantidade = 0

        return produto

    # ------------------------------------------------------
    # EXISTE LOTE DISPONÍVEL
    # ------------------------------------------------------

    produto.quantidade = int(
        lote_atual.quantidade_atual or 0
    )

    produto.preco_compra = Decimal(
        str(
            lote_atual.preco_compra or 0
        )
    )

    produto.preco_venda = Decimal(
        str(
            lote_atual.preco_venda or 0
        )
    )

    return produto


# ==========================================================
# CRIAR VENDA
# ==========================================================

@router.post(
    "/",
    response_model=VendaResponse
)
async def criar_venda(
    dados: VendaCreate,
    db: AsyncSession = Depends(get_db)
):

    try:

        # ==================================================
        # VALIDAR USUÁRIO
        # ==================================================

        resultado = await db.execute(
            select(Usuario)
            .where(
                Usuario.id == dados.usuario_id
            )
        )

        usuario = resultado.scalar_one_or_none()

        if usuario is None:

            raise HTTPException(
                status_code=404,
                detail="Usuário não encontrado"
            )

        # ==================================================
        # VALIDAR ITENS
        # ==================================================

        if not dados.itens:

            raise HTTPException(
                status_code=400,
                detail="Adicione produtos ao carrinho."
            )

        total = Decimal("0.00")

        itens_processados = []

        # ==================================================
        # PROCESSAR CADA ITEM
        # ==================================================

        for item in dados.itens:

            quantidade_pedida = int(
                item.quantidade
            )

            if quantidade_pedida <= 0:

                raise HTTPException(
                    status_code=400,
                    detail="Quantidade inválida."
                )

            # ==================================================
            # BUSCAR PRODUTO COM LOCK
            # ==================================================

            resultado = await db.execute(
                select(Produto)
                .where(
                    Produto.id == item.produto_id
                )
                .with_for_update()
            )

            produto = resultado.scalar_one_or_none()

            if produto is None:

                raise HTTPException(
                    status_code=404,
                    detail=(
                        f"Produto ID "
                        f"{item.produto_id} "
                        f"não encontrado."
                    )
                )

            # ==================================================
            # BUSCAR LOTES DISPONÍVEIS
            #
            # FIFO
            # ==================================================

            resultado = await db.execute(
                select(LoteProduto)
                .where(
                    LoteProduto.produto_id == produto.id,
                    LoteProduto.quantidade_atual > 0
                )
                .order_by(
                    LoteProduto.id.asc()
                )
            )

            lotes = resultado.scalars().all()

            # ==================================================
            # STOCK REAL DOS LOTES
            # ==================================================

            quantidade_disponivel = sum(
                int(lote.quantidade_atual or 0)
                for lote in lotes
            )

            # ==================================================
            # VALIDAR STOCK
            # ==================================================

            if quantidade_disponivel < quantidade_pedida:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Stock insuficiente: "
                        f"{produto.nome}. "
                        f"Disponível: "
                        f"{quantidade_disponivel}. "
                        f"Pedido: "
                        f"{quantidade_pedida}."
                    )
                )

            # ==================================================
            # PREÇO DO LOTE ATUAL
            #
            # O produto representa o primeiro lote FIFO.
            #
            # Este é o preço mostrado ao cliente.
            # ==================================================

            if not lotes:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"O produto "
                        f"{produto.nome} "
                        f"não possui stock disponível."
                    )
                )

            lote_atual = lotes[0]

            preco_venda = Decimal(
                str(
                    lote_atual.preco_venda or 0
                )
            )

            if preco_venda <= 0:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Preço inválido para "
                        f"{produto.nome}."
                    )
                )

            # ==================================================
            # SUBTOTAL
            # ==================================================

            subtotal_item = (
                preco_venda
                *
                Decimal(
                    str(quantidade_pedida)
                )
            )

            # ==================================================
            # CONSUMIR LOTES FIFO
            # ==================================================

            quantidade_restante = quantidade_pedida

            custo_item = Decimal("0.00")

            movimentos = []

            for lote in lotes:

                if quantidade_restante <= 0:
                    break

                quantidade_disponivel_lote = int(
                    lote.quantidade_atual or 0
                )

                quantidade_lote = min(
                    quantidade_disponivel_lote,
                    quantidade_restante
                )

                if quantidade_lote <= 0:
                    continue

                # ------------------------------------------
                # PREÇO DE COMPRA
                # ------------------------------------------

                preco_compra = Decimal(
                    str(
                        lote.preco_compra or 0
                    )
                )

                # ------------------------------------------
                # CUSTO
                # ------------------------------------------

                custo_lote = (
                    preco_compra
                    *
                    Decimal(
                        str(quantidade_lote)
                    )
                )

                custo_item += custo_lote

                # ------------------------------------------
                # REDUZIR LOTE
                # ------------------------------------------

                lote.quantidade_atual = (
                    quantidade_disponivel_lote
                    -
                    quantidade_lote
                )

                # ------------------------------------------
                # REGISTRAR MOVIMENTO
                # ------------------------------------------

                movimentos.append(
                    {
                        "lote_id": lote.id,

                        "quantidade":
                            quantidade_lote,

                        "preco_compra":
                            preco_compra,

                        # Guarda o preço efetivamente
                        # utilizado na venda.
                        "preco_venda":
                            preco_venda
                    }
                )

                quantidade_restante -= quantidade_lote

            # ==================================================
            # SEGURANÇA
            # ==================================================

            if quantidade_restante > 0:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Não foi possível consumir "
                        f"todo o stock de "
                        f"{produto.nome}."
                    )
                )

            # ==================================================
            # IMPORTANTE
            #
            # NÃO fazemos mais:
            #
            # produto.quantidade -= quantidade_pedida
            #
            # porque Produto.quantidade representa somente
            # o lote FIFO atual.
            #
            # Os lotes são a fonte real do stock.
            # ==================================================

            # ==================================================
            # SINCRONIZAR PRODUTO
            #
            # Se o lote atual acabou:
            #
            # Lote 1 = 0
            # Lote 2 = 10
            #
            # Produto passa automaticamente para:
            #
            # quantidade = 10
            # preço = preço do Lote 2
            #
            # Se não houver Lote 2:
            #
            # quantidade = 0
            # ==================================================

            await sincronizar_produto_com_lotes(
                produto,
                db
            )

            # ==================================================
            # GUARDAR ITEM PROCESSADO
            # ==================================================

            itens_processados.append(
                {
                    "produto_id":
                        produto.id,

                    "quantidade":
                        quantidade_pedida,

                    "preco_unitario":
                        preco_venda,

                    "subtotal":
                        subtotal_item,

                    "custo":
                        custo_item,

                    "movimentos":
                        movimentos
                }
            )

            # ==================================================
            # TOTAL
            # ==================================================

            total += subtotal_item

        # ==================================================
        # VALOR ENTREGUE
        # ==================================================

        valor_entregue = Decimal(
            str(
                dados.valor_entregue or 0
            )
        )

        if valor_entregue < 0:

            raise HTTPException(
                status_code=400,
                detail="Valor entregue inválido."
            )

        # ==================================================
        # VALIDAR PAGAMENTO
        # ==================================================

        if valor_entregue < total:

            raise HTTPException(
                status_code=400,
                detail=(
                    f"Valor entregue insuficiente. "
                    f"Total: {total:.2f} MT. "
                    f"Entregue: "
                    f"{valor_entregue:.2f} MT."
                )
            )

        # ==================================================
        # TROCO
        # ==================================================

        troco = (
            valor_entregue
            -
            total
        )

        # ==================================================
        # CRIAR VENDA
        # ==================================================

        venda = Venda(
            usuario_id=dados.usuario_id,
            total=total,
            valor_entregue=valor_entregue,
            troco=troco
        )

        db.add(venda)

        await db.flush()

        # ==================================================
        # CRIAR ITENS DA VENDA
        # ==================================================

        for item in itens_processados:

            item_venda = ItemVenda(
                venda_id=venda.id,

                produto_id=
                    item["produto_id"],

                quantidade=
                    item["quantidade"],

                preco_unitario=
                    item["preco_unitario"],

                subtotal=
                    item["subtotal"]
            )

            db.add(item_venda)

            await db.flush()

            # ==============================================
            # REGISTRAR LOTES UTILIZADOS
            # ==============================================

            for movimento in item["movimentos"]:

                movimento_lote = ItemVendaLote(
                    item_venda_id=
                        item_venda.id,

                    lote_id=
                        movimento["lote_id"],

                    quantidade=
                        int(
                            movimento["quantidade"]
                        ),

                    preco_compra=
                        movimento["preco_compra"],

                    preco_venda=
                        movimento["preco_venda"]
                )

                db.add(movimento_lote)

        # ==================================================
        # COMMIT
        # ==================================================

        await db.commit()

        # ==================================================
        # RECARREGAR VENDA
        # ==================================================

        resultado = await db.execute(
            select(Venda)
            .options(
                selectinload(
                    Venda.itens
                )
                .selectinload(
                    ItemVenda.produto
                )
            )
            .where(
                Venda.id == venda.id
            )
        )

        venda = resultado.scalar_one()

        return venda

    # ======================================================
    # ERRO DE VALIDAÇÃO
    # ======================================================

    except HTTPException:

        await db.rollback()

        raise

    # ======================================================
    # ERRO INTERNO
    # ======================================================

    except Exception as error:

        await db.rollback()

        print(
            "ERRO AO CRIAR VENDA:",
            repr(error)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Erro interno ao finalizar a venda."
            )
        )


# ==========================================================
# DASHBOARD - VENDAS DO DIA
# ==========================================================

@router.get(
    "/dashboard/vendas-dia"
)
async def vendas_dia(

    usuario_id: int | None = None,

    db: AsyncSession = Depends(get_db)

):

    hoje = datetime.now(
        ZoneInfo("Africa/Maputo")
    ).date()

    usuario = None

    # ==================================================
    # VERIFICAR USUÁRIO
    # ==================================================

    if usuario_id is not None:

        resultado = await db.execute(
            select(Usuario)
            .where(
                Usuario.id == usuario_id
            )
        )

        usuario = (
            resultado
            .scalar_one_or_none()
        )

        if usuario is None:

            raise HTTPException(
                status_code=404,
                detail="Usuário não encontrado"
            )

    # ==================================================
    # CONSULTA
    # ==================================================

    consulta = select(Venda)

    if (
        usuario is not None
        and usuario.tipo == "vendedor"
    ):

        consulta = consulta.where(
            Venda.usuario_id ==
            usuario.id
        )

    resultado = await db.execute(
        consulta
    )

    vendas = resultado.scalars().all()

    # ==================================================
    # SOMAR
    # ==================================================

    total = Decimal("0.00")

    for venda in vendas:

        if not venda.data_venda:
            continue

        data_venda = venda.data_venda

        if data_venda.tzinfo is None:

            data_venda = data_venda.replace(
                tzinfo=
                ZoneInfo("Africa/Maputo")
            )

        else:

            data_venda = (
                data_venda.astimezone(
                    ZoneInfo("Africa/Maputo")
                )
            )

        if data_venda.date() == hoje:

            total += Decimal(
                str(
                    venda.total or 0
                )
            )

    return {
        "vendas_dia":
            float(total)
    }


# ==========================================================
# DASHBOARD - VENDAS POR VENDEDOR
# ==========================================================

@router.get(
    "/dashboard/vendas-vendedores"
)
async def vendas_por_vendedor(

    usuario_id: int,

    db: AsyncSession = Depends(get_db)

):

    resultado = await db.execute(
        select(Usuario)
        .where(
            Usuario.id == usuario_id
        )
    )

    usuario = (
        resultado
        .scalar_one_or_none()
    )

    if usuario is None:

        raise HTTPException(
            status_code=404,
            detail="Usuário não encontrado"
        )

    consulta = (
        select(Venda)
        .options(
            selectinload(
                Venda.usuario
            ),
            selectinload(
                Venda.itens
            ).selectinload(
                ItemVenda.produto
            )
        )
    )

    # ==================================================
    # VENDEDOR
    # ==================================================

    if usuario.tipo == "vendedor":

        consulta = consulta.where(
            Venda.usuario_id ==
            usuario.id
        )

    # ==================================================
    # GERENTE
    # ==================================================

    elif usuario.tipo == "gerente":

        consulta = (
            consulta
            .join(
                Usuario,
                Venda.usuario_id ==
                Usuario.id
            )
            .where(
                Usuario.tipo ==
                "vendedor"
            )
        )

    # ==================================================
    # ADMIN
    # ==================================================

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

        chave = (
            nome
            +
            "_"
            +
            data
        )

        if chave not in dados:

            dados[chave] = {
                "vendedor":
                    nome,

                "data":
                    data,

                "total":
                    0,

                "produtos":
                    []
            }

        dados[chave]["total"] += float(
            venda.total or 0
        )

        for item in venda.itens:

            dados[chave]["produtos"].append(
                {
                    "produto":
                        item.produto.nome,

                    "quantidade":
                        item.quantidade,

                    "subtotal":
                        float(
                            item.subtotal or 0
                        )
                }
            )

    return list(
        dados.values()
    )


# ==========================================================
# DEBUG VENDAS
# ==========================================================

@router.get(
    "/dashboard/debug-vendas"
)
async def debug_vendas(

    db: AsyncSession = Depends(get_db)

):

    resultado = await db.execute(
        select(Venda)
        .order_by(
            Venda.id.desc()
        )
    )

    vendas = resultado.scalars().all()

    resultado = []

    for venda in vendas:

        resultado.append(
            {
                "id":
                    venda.id,

                "usuario_id":
                    venda.usuario_id,

                "total":
                    float(
                        venda.total or 0
                    ),

                "data_venda":
                    str(
                        venda.data_venda
                    ),

                "tipo_data":
                    str(
                        type(
                            venda.data_venda
                        )
                    )
            }
        )

    return resultado


# ==========================================================
# LISTAR VENDAS
# ==========================================================

@router.get("/")
async def listar_vendas(

    db: AsyncSession = Depends(get_db)

):

    resultado = await db.execute(
        select(Venda)
        .options(
            selectinload(
                Venda.itens
            )
        )
        .order_by(
            Venda.id.desc()
        )
    )

    vendas = (
        resultado
        .scalars()
        .all()
    )

    return vendas


# ==========================================================
# BUSCAR UMA VENDA
# ==========================================================

@router.get(
    "/{venda_id}"
)
async def buscar_venda(

    venda_id: int,

    db: AsyncSession = Depends(get_db)

):

    resultado = await db.execute(

        select(Venda)

        .options(

            selectinload(
                Venda.itens
            )
            .selectinload(
                ItemVenda.produto
            )

        )

        .where(
            Venda.id == venda_id
        )
    )

    venda = (
        resultado
        .scalar_one_or_none()
    )

    if venda is None:

        raise HTTPException(
            status_code=404,
            detail="Venda não encontrada"
        )

    return venda

# ==========================================================
# DEBUG - LOTES UTILIZADOS NAS VENDAS
# ==========================================================

@router.get(
    "/dashboard/debug-lotes-vendas"
)
async def debug_lotes_vendas(

    db: AsyncSession = Depends(get_db)

):

    resultado = await db.execute(

        select(ItemVendaLote)

        .order_by(
            ItemVendaLote.id.desc()
        )

    )

    movimentos = (
        resultado
        .scalars()
        .all()
    )

    resultado_final = []

    for movimento in movimentos:

        resultado_final.append({

            "id":
                movimento.id,

            "item_venda_id":
                movimento.item_venda_id,

            "lote_id":
                movimento.lote_id,

            "quantidade":
                float(
                    movimento.quantidade or 0
                ),

            "preco_compra":
                float(
                    movimento.preco_compra or 0
                ),

            "preco_venda":
                float(
                    movimento.preco_venda or 0
                )

        })

    return resultado_final

