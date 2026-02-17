from pydantic_settings import BaseSettings
from typing import List, Union
from pydantic import field_validator


class Settings(BaseSettings):
    # API Settings
    API_TITLE: str = "Document Processor API"
    API_VERSION: str = "1.0.0"
    API_DESCRIPTION: str = "Open-source document processing platform"
    
    # File Settings
    UPLOAD_DIR: str = "./temp_uploads"
    OUTPUT_DIR: str = "./temp_output"
    MAX_FILE_SIZE_MB: int = 25
    MAX_FILE_SIZE: int = MAX_FILE_SIZE_MB * 1024 * 1024
    FILE_RETENTION_MINUTES: int = 30
    
    # Processing Settings
    MAX_WORKERS: int = 4
    TASK_TIMEOUT: int = 300  # 5 minutes
    
    # CORS Settings
    CORS_ORIGINS: Union[List[str], str] = "http://localhost:3000"
    
    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
    
    # Supported Formats
    SUPPORTED_IMAGE_FORMATS: List[str] = ["jpg", "jpeg", "png", "webp"]
    SUPPORTED_DOCUMENT_FORMATS: List[str] = ["pdf", "docx", "txt", "html"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
