from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from database import get_db

from models.produto import Produto
from models.lote_produto import LoteProduto


router = APIRouter(
    prefix="/stock",
    tags=["Stock"]
)


# =====================================================
# LISTAR STOCK
# =====================================================
#
# AQUI O STOCK VEM DE:
#
# Produto.quantidade
#
# NÃO usar LoteProduto para o stock apresentado.
#
# =====================================================

@router.get("/")
async def listar_stock(
    db: AsyncSession = Depends(get_db)
):

    resultado = await db.execute(

        select(
            Produto.id,
            Produto.nome,
            Produto.categoria_id,
            Produto.stock_minimo,
            Produto.preco_compra,
            Produto.preco_venda,
            Produto.quantidade
        )

        .order_by(
            Produto.id.asc()
        )
    )


    resultados = resultado.all()


    return [

        {
            "id": id,

            "produto_id": id,

            "nome": nome,

            "categoria_id": categoria_id,

            "stock_minimo":
                int(stock_minimo or 0),

            "preco_compra":
                float(preco_compra or 0),

            "preco_venda":
                float(preco_venda or 0),

            "stock_total":
                int(quantidade or 0)

        }

        for (
            id,
            nome,
            categoria_id,
            stock_minimo,
            preco_compra,
            preco_venda,
            quantidade
        ) in resultados

    ]

# =====================================================
# STOCK DOS LOTES
# =====================================================
#
# Esta rota retorna a soma de:
#
# LoteProduto.quantidade_atual
#
# agrupada por produto.
#
# O FRONT DEVE USAR ESTA ROTA PARA MOSTRAR
# A QUANTIDADE DOS LOTES.
#
# =====================================================

@router.get("/lotes")
async def listar_stock_lotes(
    db: AsyncSession = Depends(get_db)
):

    resultado = await db.execute(

        select(

            Produto.id,

            Produto.nome,

            func.coalesce(
                func.sum(
                    LoteProduto.quantidade_atual
                ),
                0
            ).label(
                "stock_lotes"
            )

        )

        .outerjoin(
            LoteProduto,
            LoteProduto.produto_id == Produto.id
        )

        .group_by(
            Produto.id,
            Produto.nome
        )

        .order_by(
            Produto.id.asc()
        )

    )

    resultados = resultado.all()


    return [

        {
            "id": id,

            "produto_id": id,

            "nome": nome,

            "stock_lotes":
                int(stock_lotes or 0)

        }

        for (
            id,
            nome,
            stock_lotes
        ) in resultados

    ]
# =====================================================
# STOCK BAIXO
# =====================================================
#
# AQUI usamos LoteProduto.quantidade_atual.
#
# NÃO usamos Produto.quantidade.
#
# =====================================================

@router.get("/baixo")
async def stock_baixo(
    db: AsyncSession = Depends(get_db)
):

    resultado = await db.execute(

        select(
            Produto.id,
            Produto.nome,
            Produto.stock_minimo,

            func.coalesce(
                func.sum(
                    LoteProduto.quantidade_atual
                ),
                0
            ).label(
                "stock_total"
            )
        )

        .outerjoin(
            LoteProduto,
            LoteProduto.produto_id == Produto.id
        )

        .group_by(
            Produto.id,
            Produto.nome,
            Produto.stock_minimo
        )

        .having(

            func.coalesce(
                func.sum(
                    LoteProduto.quantidade_atual
                ),
                0
            )

            <=

            Produto.stock_minimo

        )

    )


    resultados = resultado.all()


    return [

        {
            "id": id,

            "produto_id": id,

            "nome": nome,

            "stock_minimo":
                int(stock_minimo or 0),

            "stock_total":
                int(stock_total or 0)
        }

        for (
            id,
            nome,
            stock_minimo,
            stock_total
        ) in resultados

    ]