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



class Caixa(Base):

    __tablename__ = "caixa"


    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    usuario_id = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False
    )


    # entrada ou saida
    tipo = Column(
        String(20),
        nullable=False
    )


    descricao = Column(
        String(150),
        nullable=False
    )


    valor = Column(
        Numeric(10,2),
        nullable=False
    )


    observacao = Column(
        Text,
        nullable=True
    )


    data_movimento = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )


    usuario = relationship(
        "Usuario",
        backref="movimentos_caixa"
    )



    def __repr__(self):

        return f"<Caixa {self.tipo} - {self.valor}>"