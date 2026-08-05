from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from datetime import datetime, timedelta

from database import get_db

from models.despesa import Despesa
from models.usuario import Usuario

from schemas.despesa import (
    DespesaCreate,
    DespesaUpdate,
    DespesaResponse,
    DespesaAprovar
)



router = APIRouter(
    prefix="/despesas",
    tags=["Despesas"]
)





# =====================================================
# CRIAR DESPESA DIRETA
# ADMIN / GERENTE
# =====================================================

@router.post(
    "/",
    response_model=DespesaResponse
)
async def criar_despesa(
    dados: DespesaCreate,
    db: AsyncSession = Depends(get_db)
):

    resultado = await db.execute(
        select(Usuario).where(
            Usuario.id == dados.usuario_id
        )
    )

    usuario = resultado.scalar_one_or_none()

    if not usuario:

        raise HTTPException(
            status_code=404,
            detail="Usuário não encontrado"
        )

    if usuario.tipo == "vendedor":

        raise HTTPException(
            status_code=403,
            detail="Vendedor não pode criar despesa direta"
        )

    despesa = Despesa(

        usuario_id=dados.usuario_id,

        descricao=dados.descricao,

        categoria=dados.categoria,

        valor_proposto=dados.valor_proposto,

        valor_aprovado=dados.valor_proposto,

        estado="aprovado",

        observacao=dados.observacao

    )

    db.add(despesa)

    await db.commit()

    await db.refresh(despesa)

    return despesa




# =====================================================
# LISTAR DESPESAS
#
# ADMIN / GERENTE = TODAS
# VENDEDOR = APENAS AS SUAS
# =====================================================

@router.get(
    "/usuario/{usuario_id}",
    response_model=list[DespesaResponse]
)
async def listar_despesas(
    usuario_id: int,
    db: AsyncSession = Depends(get_db)
):

    resultado = await db.execute(
        select(Usuario).where(
            Usuario.id == usuario_id
        )
    )

    usuario = resultado.scalar_one_or_none()

    if not usuario:

        raise HTTPException(
            status_code=404,
            detail="Usuário não encontrado"
        )

    consulta = select(Despesa)

    if usuario.tipo == "vendedor":

        consulta = consulta.where(
            Despesa.usuario_id == usuario_id
        )

    consulta = consulta.order_by(
        Despesa.data_despesa.desc()
    )

    resultado = await db.execute(consulta)

    return resultado.scalars().all()


# =====================================================
# LISTAR SOLICITAÇÕES PENDENTES
# ADMIN / GERENTE
# =====================================================

@router.get(
    "/pendentes",
    response_model=list[DespesaResponse]
)
async def listar_pendentes(
    usuario_id:int,
    db: AsyncSession = Depends(get_db)
):

    resultado = await db.execute(
        select(Usuario).where(
            Usuario.id == usuario_id
        )
    )

    usuario = resultado.scalar_one_or_none()


    if not usuario:

        raise HTTPException(
            status_code=404,
            detail="Usuário não encontrado"
        )


    if usuario.tipo not in [
        "admin",
        "gerente"
    ]:

        raise HTTPException(
            status_code=403,
            detail="Sem permissão"
        )

    resultado = await db.execute(

        select(Despesa)
        .order_by(
            Despesa.data_despesa.desc()
        )

    )


    return resultado.scalars().all()
# =====================================================
# ATUALIZAR DESPESA
#
# ADMIN / GERENTE
# VENDEDORES SOMENTE PENDENTES
# =====================================================

@router.put(
    "/{id}",
    response_model=DespesaResponse
)
async def atualizar_despesa(
    id:int,
    usuario_id:int,
    dados:DespesaUpdate,
    db:AsyncSession = Depends(get_db)
):


    resultado = await db.execute(
        select(Usuario).where(
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
        select(Despesa).where(
            Despesa.id == id
        )
    )


    despesa = resultado.scalar_one_or_none()



    if not despesa:

        raise HTTPException(
            404,
            "Despesa não encontrada"
        )



    # ==========================
    # VENDEDOR
    # ==========================

    if usuario.tipo == "vendedor":


        # só pode mexer nas próprias

        if despesa.usuario_id != usuario.id:

            raise HTTPException(
                403,
                "Sem permissão"
            )


        # depois de aprovada bloqueia

        if despesa.estado != "pendente":

            raise HTTPException(
                403,
                "Despesa aprovada não pode ser alterada"
            )



    # ==========================
    # ADMIN / GERENTE
    # ==========================

    elif usuario.tipo not in [
        "admin",
        "gerente"
    ]:

        raise HTTPException(
            403,
            "Sem permissão"
        )




    for campo, valor in dados.model_dump(
        exclude_unset=True
    ).items():

        setattr(
            despesa,
            campo,
            valor
        )



    await db.commit()

    await db.refresh(despesa)



    return despesa

# =====================================================
# SOLICITAR DESPESA
#
# VENDEDOR
# =====================================================

@router.post(
    "/solicitar",
    response_model=DespesaResponse
)
async def solicitar_despesa(
    dados: DespesaCreate,
    db: AsyncSession = Depends(get_db)
):


    resultado = await db.execute(
        select(Usuario).where(
            Usuario.id == dados.usuario_id
        )
    )


    usuario = resultado.scalar_one_or_none()



    if not usuario:

        raise HTTPException(
            status_code=404,
            detail="Usuário não encontrado"
        )



    if usuario.tipo != "vendedor":

        raise HTTPException(
            status_code=403,
            detail="Somente vendedor pode solicitar"
        )



    despesa = Despesa(

        usuario_id=dados.usuario_id,

        descricao=dados.descricao,

        categoria=dados.categoria,

        valor_proposto=dados.valor_proposto,

        valor_aprovado=None,

        estado="pendente",

        observacao=dados.observacao

    )


    db.add(despesa)

    await db.commit()

    await db.refresh(despesa)


    return despesa

# =====================================================
# APAGAR DESPESA
#
# ADMIN / GERENTE
# VENDEDORES SOMENTE PENDENTES
# =====================================================


@router.delete(
    "/{id}"
)
async def apagar_despesa(
    id:int,
    usuario_id:int,
    db:AsyncSession = Depends(get_db)
):


    resultado = await db.execute(
        select(Usuario).where(
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
        select(Despesa).where(
            Despesa.id == id
        )
    )


    despesa = resultado.scalar_one_or_none()



    if not despesa:

        raise HTTPException(
            404,
            "Despesa não encontrada"
        )



    # ==========================
    # VENDEDOR
    # ==========================

    if usuario.tipo == "vendedor":


        if despesa.usuario_id != usuario.id:

            raise HTTPException(
                403,
                "Sem permissão"
            )


        if despesa.estado != "pendente":

            raise HTTPException(
                403,
                "Despesa aprovada não pode ser removida"
            )



    # ==========================
    # ADMIN / GERENTE
    # ==========================

    elif usuario.tipo not in [
        "admin",
        "gerente"
    ]:

        raise HTTPException(
            403,
            "Sem permissão"
        )



    await db.delete(despesa)

    await db.commit()



    return {

        "mensagem":
        "Despesa removida"

    }

# =====================================================
# APROVAR DESPESA
# ADMIN / GERENTE
# =====================================================

@router.put(
    "/{id}/aprovar",
    response_model=DespesaResponse
)
async def aprovar_despesa(
    id:int,
    usuario_id:int,
    dados:DespesaAprovar,
    db:AsyncSession = Depends(get_db)
):


    resultado = await db.execute(
        select(Usuario).where(
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


    resultado = await db.execute(
        select(Despesa).where(
            Despesa.id == id
        )
    )


    despesa = resultado.scalar_one_or_none()


    if not despesa:
        raise HTTPException(
            404,
            "Despesa não encontrada"
        )


    despesa.valor_aprovado = dados.valor_aprovado

    despesa.estado = "aprovado"


    await db.commit()

    await db.refresh(despesa)


    return despesa