from sqlalchemy.orm import Session
import base64

from models.models import AtividadeModel
from schema.db_schema import Atividade
from datetime import datetime, timezone

# CREATE: Registar nova atividade
def criar_atividade(atividade: Atividade, db: Session, usuario_id: int):

    arquivo_bytes = None
    
    if atividade.file_base64:
        if "," in atividade.file_base64:
            base64_data = atividade.file_base64.split(",")[1]
        else:
            base64_data = atividade.file_base64
        
        arquivo_bytes = base64.b64decode(base64_data)

    try:
        nova_atividade = AtividadeModel(
            usuario_id=usuario_id,
            usf=atividade.usf,
            responsavel_acompanhamento=atividade.responsavel_acompanhamento,
            inicio_atividade=atividade.inicio_atividade,
            tipo_atividade=atividade.tipo_atividade,
            detalhes_atividade=atividade.detalhes_atividade,
            carga_horaria=atividade.carga_horaria,
            relatorio_bin=arquivo_bytes
        )
        db.add(nova_atividade)
        db.commit()
        db.refresh(nova_atividade)
        return nova_atividade

    except Exception as exc:
        db.rollback()
        raise exc

# READ: Listar todas as atividades de um residente específico
def listar_atividades_usuario(db: Session, usuario_id: int):
    return db.query(AtividadeModel).filter(AtividadeModel.usuario_id == usuario_id).all()

# UPDATE: Alterar o status da atividade (Apenas para Preceptores/Administradores)
def atualizar_status_atividade(db: Session, atividade_id: int, novo_status: str):
    atividade = db.query(AtividadeModel).filter(AtividadeModel.id == atividade_id).first()
    if atividade:
        atividade.status = novo_status
        db.commit()
        db.refresh(atividade)
    return atividade

# DELETE: Apagar atividade (Com verificação da Regra de 24 horas)
def deletar_atividade(db: Session, atividade_id: int):
    atividade = db.query(AtividadeModel).filter(AtividadeModel.id == atividade_id).first()
    
    if not atividade:
        return {"erro": "Atividade não encontrada"}

    # Verifica se passou mais de 24 horas desde a criação (Regra de Negócio 05A)
    agora = datetime.now(timezone.utc)
    diferenca_tempo = agora - atividade.data_criacao
    
    if diferenca_tempo.total_seconds() > 86400: # 86400 segundos = 24 horas
        return {"erro": "A atividade não pode ser apagada após 24 horas de registo."}
    
    db.delete(atividade)
    db.commit()
    return {"sucesso": True}