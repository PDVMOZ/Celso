from decimal import Decimal

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.usuario import Usuario
from models.venda import Venda
from models.despesa import Despesa
from models.caixa import Caixa, MovimentoCaixa



async def calcular_saldo_caixa(
    db: AsyncSession,
    usuario_id: int
):

    # =====================================
    # BUSCAR USUARIO
    # =====================================

    resultado = await db.execute(
        select(Usuario)
        .where(
            Usuario.id == usuario_id
        )
    )

    usuario = resultado.scalar_one_or_none()


    if not usuario:

        return {

            "vendas": Decimal("0.00"),

            "despesas": Decimal("0.00"),

            "retirado": Decimal("0.00"),

            "saldo_caixa": Decimal("0.00")

        }



    # =====================================
    # SOMAR VENDAS
    # tabela: vendas
    # campo: total
    # =====================================

    resultado = await db.execute(

        select(
            func.coalesce(
                func.sum(
                    Venda.total
                ),
                0
            )
        )

        .where(
            Venda.usuario_id == usuario_id
        )

    )


    vendas = Decimal(
        str(
            resultado.scalar() or 0
        )
    )




    # =====================================
    # SOMAR DESPESAS APROVADAS
    # tabela: despesas
    # campo: valor_aprovado
    # =====================================

    resultado = await db.execute(

        select(
            func.coalesce(
                func.sum(
                    Despesa.valor_aprovado
                ),
                0
            )
        )

        .where(

            Despesa.usuario_id == usuario_id,

            Despesa.estado == "aprovado"

        )

    )


    despesas = Decimal(
        str(
            resultado.scalar() or 0
        )
    )




    # =====================================
    # DEFINIR TIPO DE SAIDA
    #
    # vendedor:
    #   RECOLHA
    #
    # admin/gerente:
    #   RETIRADA
    #
    # =====================================

    if usuario.tipo == "vendedor":

        tipo_saida = "RECOLHA"

    else:

        tipo_saida = "RETIRADA"




    # =====================================
    # SOMAR RECOLHAS / RETIRADAS
    #
    # tabela:
    # movimentos_caixa
    #
    # campo:
    # valor
    #
    # =====================================

    resultado = await db.execute(

        select(

            func.coalesce(

                func.sum(

                    MovimentoCaixa.valor

                ),

                0

            )

        )

        .join(

            Caixa

        )

        .where(

            Caixa.usuario_id == usuario_id,

            MovimentoCaixa.tipo == tipo_saida

        )

    )


    retirado = Decimal(
        str(
            resultado.scalar() or 0
        )
    )




    # =====================================
    # SALDO FINAL
    # =====================================

    saldo_caixa = (

        vendas

        - despesas

        - retirado

    )




    return {

        "vendas": vendas,

        "despesas": despesas,

        "retirado": retirado,

        "saldo_caixa": saldo_caixa

    }