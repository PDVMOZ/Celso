from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from sqlalchemy import func

from datetime import datetime


from database import get_db


from models.caixa import Caixa


from schemas.caixa import (
    CaixaCreate,
    CaixaUpdate,
    CaixaResponse
)



router = APIRouter(
    prefix="/caixa",
    tags=["Caixa"]
)





# ==========================
# CRIAR MOVIMENTO
# ==========================

@router.post(
    "/",
    response_model=CaixaResponse
)
def criar_movimento(
    dados: CaixaCreate,
    db: Session = Depends(get_db)
):


    if dados.tipo not in [
        "entrada",
        "saida"
    ]:

        raise HTTPException(
            400,
            "Tipo deve ser entrada ou saida"
        )



    movimento = Caixa(

        usuario_id=dados.usuario_id,

        tipo=dados.tipo,

        descricao=dados.descricao,

        valor=dados.valor,

        observacao=dados.observacao

    )


    db.add(movimento)

    db.commit()

    db.refresh(movimento)



    return movimento







# ==========================
# LISTAR MOVIMENTOS
# ==========================

@router.get(
    "/",
    response_model=list[CaixaResponse]
)
def listar_movimentos(
    db:Session=Depends(get_db)
):

    return db.query(
        Caixa
    ).order_by(
        Caixa.data_movimento.desc()
    ).all()








# ==========================
# BUSCAR POR ID
# ==========================

@router.get(
    "/{id}",
    response_model=CaixaResponse
)
def buscar_movimento(
    id:int,
    db:Session=Depends(get_db)
):


    movimento=db.query(
        Caixa
    ).filter(
        Caixa.id==id
    ).first()



    if not movimento:

        raise HTTPException(
            404,
            "Movimento não encontrado"
        )


    return movimento







# ==========================
# SALDO ATUAL
# ==========================

@router.get(
    "/saldo"
)
def saldo_caixa(
    db:Session=Depends(get_db)
):


    entradas=db.query(
        func.sum(Caixa.valor)
    ).filter(
        Caixa.tipo=="entrada"
    ).scalar() or 0




    saidas=db.query(
        func.sum(Caixa.valor)
    ).filter(
        Caixa.tipo=="saida"
    ).scalar() or 0



    return {

        "entradas": entradas,

        "saidas": saidas,

        "saldo":
            entradas - saidas

    }








# ==========================
# RESUMO DO DIA
# ==========================

@router.get(
    "/hoje"
)
def caixa_hoje(
    db:Session=Depends(get_db)
):


    hoje=datetime.now().date()



    entradas=db.query(
        func.sum(Caixa.valor)
    ).filter(

        Caixa.tipo=="entrada"

    ).filter(

        func.date(
            Caixa.data_movimento
        ) == hoje

    ).scalar() or 0




    saidas=db.query(
        func.sum(Caixa.valor)
    ).filter(

        Caixa.tipo=="saida"

    ).filter(

        func.date(
            Caixa.data_movimento
        ) == hoje

    ).scalar() or 0




    return {

        "entradas": entradas,

        "saidas": saidas,

        "saldo": entradas-saidas

    }







# ==========================
# APAGAR
# ==========================

@router.delete("/{id}")
def apagar_movimento(
    id:int,
    db:Session=Depends(get_db)
):


    movimento=db.query(
        Caixa
    ).filter(
        Caixa.id==id
    ).first()



    if not movimento:

        raise HTTPException(
            404,
            "Movimento não encontrado"
        )



    db.delete(movimento)

    db.commit()



    return {

        "mensagem":
        "Movimento removido"

    }