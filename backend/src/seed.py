import os
import random
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from core.database import SessionLocal, Base, engine
from models.models import UsuarioModel, AtividadeModel
from core.security import pwd_context
from services.rcode_generate import generate_code_resident

def get_pdf_bytes():
    # Caminho ajustado para a pasta assets na raiz do backend
    pdf_path = os.path.join("assets", "relatorio_teste.pdf")
    if os.path.exists(pdf_path):
        with open(pdf_path, "rb") as f:
            return f.read()
    return None

def run_seed(isEnabled: bool):

    if isEnabled:
        #verifica a integridade do db
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        
        try:
            # Verifica se o utilizador teste já existe
            existing_user = db.query(UsuarioModel).filter(UsuarioModel.email == "residente@teste.com").first()
            
            if existing_user:
                print("✅ Banco já populado. Seed abortado para evitar duplicidade.")
                return

            print("👤 Criando residente de teste...")
            pdf_data = get_pdf_bytes()
            resident_code = "202629469330"
            
            novo_usuario = UsuarioModel(
                codigo_residente=resident_code,
                email="residente@teste.com",
                senha_padrao=pwd_context.hash("Mudar@123"),
                nome_completo="Residente Teste MVP",
                cpf="000.020.000-00",
                data_nascimento="1995-05-15",
                area_atuacao="Enfermagem",
                inicio_residencia="2026-01-01"
            )
            db.add(novo_usuario)
            db.commit()
            db.refresh(novo_usuario)

            print("Injetando 15 atividades simuladas...")
            status_options = ["APROVADO", "PENDENTE", "REJEITADO"]
            
            for i in range(15):
                dias_atras = random.randint(1, 30)
                data_atividade = datetime.now(timezone.utc) - timedelta(days=dias_atras)
                
                atividade = AtividadeModel(
                    usuario_id=novo_usuario.id,
                    usf=f"USF Unidade {random.randint(1, 10)}",
                    responsavel_acompanhamento="Preceptor Teste",
                    detalhes_atividade=f"Atividade prática de simulação nº {i+1}",
                    tipo_atividade="Atendimento",
                    inicio_atividade=data_atividade.strftime("%Y-%m-%d"),
                    carga_horaria=random.randint(2, 8),
                    status=random.choice(status_options),
                    relatorio_bin=pdf_data # Injeta o PDF aqui
                )
                db.add(atividade)
                
            db.commit()
            print("Seed concluído com sucesso!")

        
        finally:
            db.close()