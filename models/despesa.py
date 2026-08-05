from sqlalchemy import (
    Column,
    Integer,
    String,
    Numeric,
    DateTime,
    ForeignKey,
    Text
)

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base



class Despesa(Base):

    __tablename__ = "despesas"



    id = Column(
        Integer,
        primary_key=True,
        index=True
    )



    # Usuário que criou a solicitação
    # ou responsável pela despesa

    usuario_id = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False
    )



    descricao = Column(
        String(150),
        nullable=False
    )



    categoria = Column(
        String(100),
        nullable=True
    )



    # Valor sugerido pelo vendedor

    valor_proposto = Column(
        Numeric(10,2),
        nullable=True
    )



    # Valor definido pelo gerente/admin

    valor_aprovado = Column(
        Numeric(10,2),
        nullable=True
    )



    observacao = Column(
        Text,
        nullable=True
    )



    # Estados possíveis:
    #
    # pendente  -> vendedor solicitou
    # aprovado  -> gerente/admin autorizou
    # recusado  -> pedido negado
    #

    estado = Column(
        String(30),
        nullable=False,
        default="pendente"
    )



    data_despesa = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )



    usuario = relationship(
        "Usuario",
        backref="despesas"
    )



    def __repr__(self):

        return f"<Despesa {self.descricao}>"