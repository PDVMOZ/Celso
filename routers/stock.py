from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db

from models.produto import Produto


router = APIRouter(
    prefix="/stock",
    tags=["Stock"]
)


# ==========================
# LISTAR STOCK
# ==========================

@router.get("/")
async def listar_stock(
    db: AsyncSession = Depends(get_db)
):

    resultado = await db.execute(
        select(Produto)
    )

    produtos = resultado.scalars().all()

    return produtos



# ==========================
# STOCK BAIXO
# ==========================

@router.get("/baixo")
async def stock_baixo(
    db: AsyncSession = Depends(get_db)
):

    resultado = await db.execute(
        select(Produto)
        .where(
            Produto.quantidade <= Produto.stock_minimo
        )
    )


    produtos = resultado.scalars().all()


    return produtos




# ==========================
# ENTRADA STOCK
# ==========================

@router.put("/entrada/{produto_id}")
async def entrada_stock(
    produto_id:int,
    quantidade:int,
    db:AsyncSession = Depends(get_db)
):


    if quantidade <= 0:

        raise HTTPException(
            400,
            "Quantidade inválida"
        )


    resultado = await db.execute(

        select(Produto)
        .where(
            Produto.id == produto_id
        )

    )


    produto = resultado.scalar_one_or_none()



    if not produto:

        raise HTTPException(
            404,
            "Produto não encontrado"
        )



    produto.quantidade += quantidade


    await db.commit()

    await db.refresh(produto)



    return {

        "mensagem":"Stock atualizado",

        "produto":produto.nome,

        "quantidade_actual":produto.quantidade

    }





# ==========================
# SAÍDA STOCK
# ==========================

@router.put("/saida/{produto_id}")
async def saida_stock(
    produto_id:int,
    quantidade:int,
    db:AsyncSession = Depends(get_db)
):


    if quantidade <= 0:

        raise HTTPException(
            400,
            "Quantidade inválida"
        )



    resultado = await db.execute(

        select(Produto)
        .where(
            Produto.id == produto_id
        )

    )


    produto = resultado.scalar_one_or_none()



    if not produto:

        raise HTTPException(
            404,
            "Produto não encontrado"
        )



    if produto.quantidade < quantidade:

        raise HTTPException(
            400,
            "Stock insuficiente"
        )



    produto.quantidade -= quantidade



    await db.commit()

    await db.refresh(produto)



    return {

        "mensagem":"Stock reduzido",

        "produto":produto.nome,

        "quantidade_actual":produto.quantidade

    }
