import re
from typing import Optional

from info_model import InfoModel

# name, tag, url, namespace

class FluxOCIRepository(InfoModel):
  name: str
  tag: str
  url: str
  namespace: Optional[str]
  repo_name: str

class FluxOCIRepositoryScanner:
  api_version = "source.toolkit.fluxcd.io"
  kind = "OCIRepository"
  def pre_check(self, stream) -> bool:
    try:
      contains_api_version = False
      contains_kind = False
      for line in stream:
        if line.strip().startswith("apiVersion: " + self.api_version):
          contains_api_version = True
        if line.strip() == "kind: " + self.kind:
          contains_kind = True
        if contains_api_version and contains_kind:
          return True
    except UnicodeDecodeError as e:
      print("unicode error", e) 
    return False

  def check(self, walk) -> bool:
    return walk('apiVersion', lambda x: x.startswith(self.api_version)) and \
      walk('kind', lambda x: x == self.kind) and \
      walk('metadata.name', lambda x: re.match(r'^[^{}]+$', x) is not None)
    
  def parse(self, walk, rest: InfoModel) -> FluxOCIRepository:
    name = walk('metadata.name')
    tag = walk('spec.ref.tag')
    url = walk('spec.url')
    namespace = walk('metadata.namespace')

    return FluxOCIRepository.parse_obj(rest.dict() | {
      'name': name,
      'tag': tag,
      'url': url,
      'namespace': namespace,
      'repo_name': rest.repo_name,
    })

  def create_table(self, c1, c2):
    c1.execute('''DROP TABLE IF EXISTS flux_oci_repository''')
    c1.execute('''CREATE TABLE IF NOT EXISTS flux_oci_repository
                  (name text NOT NULL, 
                  tag text NOT NULL, 
                  url text NOT NULL,
                  namespace text NULL,
                  repo_name text NOT NULL)''')

  def insert(self, c1, c2, data: FluxOCIRepository):
    c1.execute(
      "INSERT INTO flux_oci_repository VALUES (?, ?, ?, ?, ?)",
      (
        data.name, 
        data.tag, 
        data.url,
        data.namespace,
        data.repo_name,
      ))
  
  def test(self, c1, c2) -> bool:
    c1.execute("SELECT count(*) FROM flux_oci_repository")
    c = c1.fetchone()[0]
    print("flux_oci_repository count", c)
    return c > 100
