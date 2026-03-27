from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://user:pass@localhost:5432/aooi"
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    default_payment_provider: str = "stripe"
    public_app_url: str = "http://localhost:3000"


settings = Settings()
