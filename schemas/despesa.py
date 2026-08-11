from pydantic import BaseModel, ConfigDict
from decimal import Decimal
from datetime import datetime


# =====================================================
# CRIAR SOLICITAÇÃO / DESPESA
# =====================================================

class DespesaCreate(BaseModel):

    usuario_id: int

    descricao: str

    categoria: str | None = None

    # Valor sugerido pelo vendedor
    valor_proposto: Decimal | None = None

    observacao: str | None = None


# =====================================================
# ATUALIZAR DESPESA
# =====================================================

class DespesaUpdate(BaseModel):

    descricao: str | None = None

    categoria: str | None = None

    valor_proposto: Decimal | None = None

    valor_aprovado: Decimal | None = None

    estado: str | None = None

    observacao: str | None = None


# =====================================================
# APROVAR DESPESA
# =====================================================

class DespesaAprovar(BaseModel):

    valor_aprovado: Decimal

    categoria: str | None = None

    observacao: str | None = None


# =====================================================
# RESPOSTA
# =====================================================

class DespesaResponse(BaseModel):

    id: int

    usuario_id: int

    # =================================================
    # NOME DE QUEM SOLICITOU / CRIOU
    # =================================================

    solicitante_nome: str | None = None

    descricao: str

    categoria: str | None = None

    valor_proposto: Decimal | None = None

    valor_aprovado: Decimal | None = None

    estado: str

    observacao: str | None = None

    data_despesa: datetime

    model_config = ConfigDict(
        from_attributes=True
    )