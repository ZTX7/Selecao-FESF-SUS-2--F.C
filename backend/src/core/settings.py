from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

load_dotenv()

#Configurações Globais do projeto
class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="src/.env", 
        env_file_encoding="utf-8", 
        extra="ignore")

    # APP
    PROJECT_NAME: str = "RESISUS API"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    BASE_PREFIX: str = "/api/v1"

    #USUARIO MOCK
    MOCK_ENABLED: bool = True

    #CORS MIDDLEWARE
    ALLOW_ORIGINS: list[str] = ["http://localhost:3000"]

    # JWT
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # DATABASE
    DATABASE_URL: str

settings = Settings()

