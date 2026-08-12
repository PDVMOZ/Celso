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
            "saldo_recolhido": Decimal("0.00"),
            "saldo_caixa": Decimal("0.00")
        }


    # =====================================
    # SOMAR VENDAS
    # =====================================

    resultado = await db.execute(

        select(
            func.coalesce(
                func.sum(Venda.total),
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
    # SOMAR DESPESAS NORMAIS
    #
    # IMPORTANTE:
    #
    # Somente despesas com
    # valor_aprovado preenchido entram
    # aqui.
    #
    # Despesas pagas com dinheiro
    # recolhido ficam com valor_aprovado
    # NULL e não entram na caixa
    # do vendedor.
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
            Despesa.estado == "aprovado",
            Despesa.valor_aprovado.is_not(None)
        )

    )

    despesas = Decimal(
        str(
            resultado.scalar() or 0
        )
    )


    # =====================================
    # VENDEDOR
    #
    # A saída da caixa é RECOLHA.
    # =====================================

    if usuario.tipo == "vendedor":

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
                MovimentoCaixa.tipo == "RECOLHA"
            )

        )

        retirado = Decimal(
            str(
                resultado.scalar() or 0
            )
        )

        saldo_recolhido = Decimal("0.00")

        saldo_caixa = (
            vendas
            - despesas
            - retirado
        )


        return {

            "vendas": vendas,

            "despesas": despesas,

            "retirado": retirado,

            "saldo_recolhido":
                saldo_recolhido,

            "saldo_caixa":
                saldo_caixa

        }


    # =====================================
    # ADMIN / GERENTE
    #
    # Aqui existe dinheiro recebido
    # através das recolhas dos vendedores.
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
            MovimentoCaixa.tipo == "RECOLHA_RECEBIDA"
        )

    )

    recolhido_recebido = Decimal(
        str(
            resultado.scalar() or 0
        )
    )


    # =====================================
    # DESPESAS PAGAS COM DINHEIRO
    # RECOLHIDO
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
            MovimentoCaixa.tipo == "DESPESA_RECOLHIDA"
        )

    )

    despesas_recolhidas = Decimal(
        str(
            resultado.scalar() or 0
        )
    )


    # =====================================
    # RETIRADAS DO ADMIN / GERENTE
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
            MovimentoCaixa.tipo == "RETIRADA"
        )

    )

    retirado = Decimal(
        str(
            resultado.scalar() or 0
        )
    )


    # =====================================
    # SALDO DISPONÍVEL DO DINHEIRO
    # RECOLHIDO
    # =====================================

    saldo_recolhido = (
        recolhido_recebido
        - despesas_recolhidas
        - retirado
    )


    if saldo_recolhido < 0:

        saldo_recolhido = Decimal("0.00")


    # =====================================
    # SALDO FINAL
    #
    # Mantemos vendas/despesas próprias
    # e adicionamos o dinheiro recebido
    # das recolhas.
    # =====================================

    saldo_caixa = (
        vendas
        - despesas
        + recolhido_recebido
        - despesas_recolhidas
        - retirado
    )


    return {

        "vendas": vendas,

        "despesas": despesas,

        "retirado": retirado,

        "saldo_recolhido":
            saldo_recolhido,

        "saldo_caixa":
            saldo_caixa

    }
