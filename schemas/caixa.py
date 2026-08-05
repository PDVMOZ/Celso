from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime



# Criar movimento

class CaixaCreate(BaseModel):

    usuario_id: int

    tipo: str
    # entrada ou saida


    descricao: str


    valor: Decimal


    observacao: str | None = None





# Atualizar movimento

class CaixaUpdate(BaseModel):

    tipo: str | None = None

    descricao: str | None = None

    valor: Decimal | None = None

    observacao: str | None = None





# Resposta

class CaixaResponse(BaseModel):

    id: int

    usuario_id: int

    tipo: str

    descricao: str

    valor: Decimal

    observacao: str | None

    data_movimento: datetime



    class Config:

        from_attributes = True