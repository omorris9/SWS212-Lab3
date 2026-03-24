from pydantic import BaseModel

class Incident(BaseModel):
    title: str
    description: str
    severity: str