from sqlmodel import SQLModel, Field

class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    email: str = Field(index=True, unique=True)
    software_experience: str | None
    hardware_experience: str | None
    hashed_password: str
    is_active: bool = True
