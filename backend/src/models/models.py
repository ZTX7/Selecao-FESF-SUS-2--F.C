from sqlalchemy import Column, Integer, Text, String, LargeBinary, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship

from core.database import Base

class UsuarioModel(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True) 
    codigo_residente = Column(String, unique=True, index=True, nullable=False) 
    email = Column(String, unique=True, nullable=False)
    senha_padrao = Column(String, nullable=False) 
    nome_completo = Column(String, nullable=False) 
    cpf = Column(String, unique=True, nullable=False)
    data_nascimento = Column(String, nullable=False)
    area_atuacao = Column(String, nullable=False) 
    inicio_residencia = Column(String, nullable=False)
    data_registro = Column(DateTime(timezone=True), server_default=func.now()) 
    

    atividades = relationship("AtividadeModel", back_populates="dono")

class AtividadeModel(Base):
    __tablename__ = "atividades"

    id = Column(Integer, primary_key=True, index=True) 
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False) 
    usf = Column(String, nullable=False) 
    responsavel_acompanhamento = Column(String, nullable=False) 
    detalhes_atividade = Column(Text, nullable=True)
    tipo_atividade = Column(String, nullable=False)
    inicio_atividade = Column(String, nullable=False)
    carga_horaria = Column(Integer, nullable=False) 
    relatorio_bin = Column(LargeBinary, nullable=True)

    status = Column(String, default="PENDENTE", nullable=False) 
    data_criacao = Column(DateTime(timezone=True), server_default=func.now()) 

    dono = relationship("UsuarioModel", back_populates="atividades")