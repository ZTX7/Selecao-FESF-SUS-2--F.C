from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv
import os

load_dotenv()

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file="src/.env", env_file_encoding="utf-8")

    #JWT CONFIG
    SECRET_KEY: str = "super_secret_key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    #POSTGRESQL
    DATABASE_URL: str = f"postgresql://postgres:{os.getenv('PASSWORD_POSTGRESQL')}@localhost:5432/resisus_db"


settings = Settings()
