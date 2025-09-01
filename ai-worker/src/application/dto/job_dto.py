from pydantic import BaseModel

class JobProcessRequest(BaseModel):
    job_id: str