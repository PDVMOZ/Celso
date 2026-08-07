from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from fastapi import HTTPException

from models.caixa import (
    Caixa,
    MovimentoCaixa
)



# =====================================================
# GARANTIR QUE O USUARIO TEM CAIXA
# =====================================================

async def obter_ou_criar_caixa(
    db: AsyncSession,
    usuario_id:int
):

    resultado = await db.execute(

        select(Caixa)
        .where(
            Caixa.usuario_id == usuario_id
        )

    )


    caixa = resultado.scalar_one_or_none()



    if caixa:

        return caixa



    caixa = Caixa(

        usuario_id=usuario_id,

        saldo=0

    )


    db.add(caixa)


    await db.flush()


    return caixa





# =====================================================
# ENTRADA DE DINHEIRO
#
# VENDA
# =====================================================

async def adicionar_entrada_caixa(

    db:AsyncSession,

    usuario_id:int,

    valor,

    descricao,

    responsavel_id=None

):


    caixa = await obter_ou_criar_caixa(
        db,
        usuario_id
    )



    saldo_anterior = caixa.saldo



    novo_saldo = (
        saldo_anterior + valor
    )



    caixa.saldo = novo_saldo



    movimento = MovimentoCaixa(

        caixa_id=caixa.id,

        tipo="ENTRADA",

        descricao=descricao,

        valor=valor,

        saldo_anterior=saldo_anterior,

        saldo_depois=novo_saldo,

        responsavel_id=responsavel_id

    )


    db.add(movimento)


    await db.flush()



    return caixa






# =====================================================
# SAIDA DE DINHEIRO
#
# DESPESA
# =====================================================

async def adicionar_saida_caixa(

    db:AsyncSession,

    usuario_id:int,

    valor,

    descricao,

    responsavel_id=None,

    observacao=None

):


    caixa = await obter_ou_criar_caixa(
        db,
        usuario_id
    )



    if caixa.saldo < valor:

        raise HTTPException(

            400,

            "Saldo insuficiente na caixa"

        )



    saldo_anterior = caixa.saldo



    novo_saldo = (
        saldo_anterior - valor
    )



    caixa.saldo = novo_saldo




    movimento = MovimentoCaixa(

        caixa_id=caixa.id,

        tipo="SAIDA",

        descricao=descricao,

        valor=valor,

        saldo_anterior=saldo_anterior,

        saldo_depois=novo_saldo,

        responsavel_id=responsavel_id,

        observacao=observacao

    )


    db.add(movimento)


    await db.flush()



    return caixa





# =====================================================
# RECOLHA
#
# GERENTE / ADMIN
# =====================================================

async def recolher_dinheiro(

    db:AsyncSession,

    vendedor_id:int,

    valor,

    responsavel_id:int,

    observacao=None

):


    caixa = await obter_ou_criar_caixa(

        db,

        vendedor_id

    )



    if caixa.saldo < valor:

        raise HTTPException(

            400,

            "Valor superior ao saldo da caixa"

        )



    saldo_anterior = caixa.saldo



    novo_saldo = (
        saldo_anterior - valor
    )



    caixa.saldo = novo_saldo




    movimento = MovimentoCaixa(

        caixa_id=caixa.id,

        tipo="RECOLHA",

        descricao="Recolha de dinheiro",

        valor=valor,

        saldo_anterior=saldo_anterior,

        saldo_depois=novo_saldo,

        responsavel_id=responsavel_id,

        observacao=observacao

    )


    db.add(movimento)


    await db.flush()



    return caixa
