from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from api.v1.dependencies import get_current_user
from models.models import UsuarioModel, AtividadeModel
from core.database import get_db
from schemas.db_schema import Atividade, AtividadeResponse
from repositories.activities_repository import criar_atividade, listar_atividades_usuario

router = APIRouter()

@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_activities(payload: Atividade, 
                            db: Session = Depends(get_db), 
                            current_user: UsuarioModel = Depends(get_current_user)):
    
    try:
        nova_atividade = criar_atividade(
            db=db, 
            atividade=payload, 
            usuario_id=current_user.id
        )
        
        return {
            "mensagem": "Atividade registrada com sucesso!",
            "atividade_id": nova_atividade.id
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Erro ao registrar atividade: {str(e)}"
        )

@router.get("/get-activities", response_model=List[AtividadeResponse], status_code=status.HTTP_200_OK)
async def list_activities(db: Session = Depends(get_db), current_user: UsuarioModel = Depends(get_current_user)):
    try:
        return listar_atividades_usuario(db=db, usuario_id=current_user.id)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao buscar atividades no servidor."
        )

@router.get("/{activity_id}", response_model=AtividadeResponse, status_code=status.HTTP_200_OK)
async def get_activity_detail(
    activity_id: int, 
    db: Session = Depends(get_db), 
    current_user: UsuarioModel = Depends(get_current_user)
):
    # 1. Busca a atividade específica no banco
    atividade = db.query(AtividadeModel).filter(
        AtividadeModel.id == activity_id,
        AtividadeModel.usuario_id == current_user.id 
    ).first()

    if not atividade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Atividade não encontrada ou você não tem permissão para visualizá-la."
        )
    
    return atividade

@router.get("/download/{activity_id}")
def download_activity_report(
    activity_id: int, 
    db: Session = Depends(get_db), 
    current_user: UsuarioModel = Depends(get_current_user)
):
    activity = db.query(AtividadeModel).filter(
        AtividadeModel.id == activity_id,
        AtividadeModel.usuario_id == current_user.id
    ).first()
    
    if not activity or not activity.relatorio_bin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Relatório não encontrado ou ficheiro não anexado."
        )
    
    return Response(
        content=activity.relatorio_bin,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="relatorio_atividade_{activity_id}.pdf"'}
    )