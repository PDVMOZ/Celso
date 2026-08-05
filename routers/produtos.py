from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db

from models.produto import Produto

from schemas.produto import (
    ProdutoCreate,
    ProdutoUpdate,
    ProdutoResponse
)



router = APIRouter(
    prefix="/produtos",
    tags=["Produtos"]
)



# =====================================
# LISTAR PRODUTOS
# =====================================

@router.get(
    "/",
    response_model=list[ProdutoResponse]
)
async def listar_produtos(
    db: AsyncSession = Depends(get_db)
):

    resultado = await db.execute(
        select(Produto)
    )

    produtos = resultado.scalars().all()


    return produtos



# =====================================
# CRIAR PRODUTO
# =====================================

@router.post(
    "/",
    response_model=ProdutoResponse
)
async def criar_produto(
    dados: ProdutoCreate,
    db: AsyncSession = Depends(get_db)
):

    produto = Produto(

        categoria_id=dados.categoria_id,

        nome=dados.nome,

        descricao=dados.descricao,

        preco_compra=dados.preco_compra,

        preco_venda=dados.preco_venda,

        quantidade=dados.quantidade,

        stock_minimo=dados.stock_minimo,

        unidade=dados.unidade,

        ativo=True
    )


    db.add(produto)


    await db.commit()


    await db.refresh(produto)


    return produto



# =====================================
# BUSCAR PRODUTO
# =====================================

@router.get(
    "/{produto_id}",
    response_model=ProdutoResponse
)
async def buscar_produto(
    produto_id: int,
    db: AsyncSession = Depends(get_db)
):

    resultado = await db.execute(
        select(Produto).where(
            Produto.id == produto_id
        )
    )


    produto = resultado.scalar_one_or_none()



    if not produto:

        raise HTTPException(
            status_code=404,
            detail="Produto não encontrado"
        )



    return produto



# =====================================
# ATUALIZAR PRODUTO
# =====================================

@router.put(
    "/{produto_id}",
    response_model=ProdutoResponse
)
async def atualizar_produto(
    produto_id: int,
    dados: ProdutoUpdate,
    db: AsyncSession = Depends(get_db)
):

    resultado = await db.execute(
        select(Produto).where(
            Produto.id == produto_id
        )
    )


    produto = resultado.scalar_one_or_none()



    if not produto:

        raise HTTPException(
            status_code=404,
            detail="Produto não encontrado"
        )



    campos = dados.model_dump(
        exclude_unset=True
    )



    for campo, valor in campos.items():

        setattr(
            produto,
            campo,
            valor
        )



    await db.commit()


    await db.refresh(produto)



    return produto



# =====================================
# DESATIVAR PRODUTO
# =====================================

@router.delete(
    "/{produto_id}"
)
async def remover_produto(
    produto_id: int,
    db: AsyncSession = Depends(get_db)
):

    resultado = await db.execute(
        select(Produto).where(
            Produto.id == produto_id
        )
    )


    produto = resultado.scalar_one_or_none()



    if not produto:

        raise HTTPException(
            status_code=404,
            detail="Produto não encontrado"
        )



    produto.ativo = False



    await db.commit()



    return {

        "mensagem":
        "Produto desativado"

    }
