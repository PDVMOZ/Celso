from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db

from models.produto import Produto
from models.venda import Venda
from models.despesa import Despesa


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/")
async def dashboard(
    db: AsyncSession = Depends(get_db)
):

    hoje = datetime.now().date()



    # =========================
    # VENDAS HOJE
    # =========================

    result = await db.execute(
        select(func.sum(Venda.total))
        .where(
            func.date(Venda.data_venda) == hoje
        )
    )

    vendas_hoje = result.scalar() or 0




    # =========================
    # TOTAL PRODUTOS
    # =========================

    result = await db.execute(
        select(func.count(Produto.id))
    )

    produtos_total = result.scalar() or 0




    # =========================
    # PRODUTOS BAIXO STOCK
    # =========================

    result = await db.execute(
        select(Produto)
        .where(
            Produto.quantidade <= Produto.stock_minimo
        )
    )

    produtos_baixo_stock = result.scalars().all()



    baixo_stock_total = len(produtos_baixo_stock)





    # =========================
    # PRODUTOS NOVOS
    # ÚLTIMOS 30 DIAS
    # =========================

    data_inicio = (
        datetime.now()
        -
        timedelta(days=30)
    )


    result = await db.execute(
        select(func.count(Produto.id))
        .where(
            Produto.criado_em >= data_inicio
        )
    )


    produtos_novos = result.scalar() or 0




    # =========================
    # DESPESAS HOJE
    # =========================

    # =========================
    # DESPESAS HOJE
    # SOMENTE DESPESAS APROVADAS
    # =========================

    result = await db.execute(

        select(
            func.sum(
                Despesa.valor_aprovado
            )
        )
        .where(
            func.date(
                Despesa.data_despesa
            ) == hoje
        )
        .where(
            Despesa.estado == "aprovado"
        )

    )

    despesas = result.scalar() or 0




    # =========================
    # LUCRO
    # =========================

    lucro = vendas_hoje - despesas




    # =========================
    # RETORNO DASHBOARD
    # =========================

    return {


        "vendas_hoje": float(vendas_hoje),


        "despesas_hoje": float(despesas),


        "lucro_hoje": float(lucro),



        "stock": {


            # quantidade total de produtos

            "total": produtos_total,



            # produtos criados nos últimos 30 dias

            "produtos_novos": produtos_novos,



            # número que aparece no card

            "baixo_stock_total": baixo_stock_total,



            # lista que aparece nos alertas

            "baixo_stock": [

                {

                    "id": p.id,

                    "nome": p.nome,

                    "quantidade": p.quantidade,

                    "stock_minimo": p.stock_minimo

                }

                for p in produtos_baixo_stock

            ]

        }

    }
