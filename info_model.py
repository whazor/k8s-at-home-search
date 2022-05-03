from pydantic import BaseModel

class InfoModel(BaseModel):
  repo_name: str
  amount_lines: int
  url: str
  timestamp: str