from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str 
    software_experience: str
    hardware_experience: str
    email: EmailStr
    password: str

class UserRead(BaseModel):
    id: int
    name: str
    software_experience: str
    hardware_experience: str
    email: EmailStr
    is_active: bool

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str