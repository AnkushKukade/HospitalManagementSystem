from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str
    role: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    entity_id: str


class ChangeCredentialsRequest(BaseModel):
    new_username: str
    new_password: str
