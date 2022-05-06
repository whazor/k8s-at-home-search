from typing import Optional

from info_model import InfoModel

class FluxHelmRepo(InfoModel):
  helm_repo_name: str
  namespace: str
  helm_repo_url: str
  interval: Optional[str]

class FluxHelmRepoScanner:
  api_version = "source.toolkit.fluxcd.io"
  kind = "HelmRepository"
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
      walk('spec.url', lambda x: x is not None) and \
      walk('metadata.name', lambda x: x is not None) and \
      walk('metadata.namespace', lambda x: x is not None)

  def parse(self, walk, rest: InfoModel) -> FluxHelmRepo:
    name = walk('metadata.name')
    namespace = walk('metadata.namespace')
    url = walk('spec.url')
    interval = walk('spec.interval')
    return FluxHelmRepo.parse_obj(rest.dict() | {
      'helm_repo_name': name,
      'namespace': namespace,
      'helm_repo_url': url.rstrip('/') + '/',
      'interval': interval,
    })

  def create_table(self, c):
    c.execute('''DROP TABLE IF EXISTS flux_helm_repo''')
    c.execute('''CREATE TABLE IF NOT EXISTS flux_helm_repo
                  (helm_repo_name text NOT NULL,
                  namespace text NOT NULL,
                  helm_repo_url text NOT NULL,
                  interval text NULL,
                  repo_name text NOT NULL,
                  lines number NOT NULL,
                  url text NOT NULL,
                  timestamp text NOT NULL)''')


  def insert(self, c, data: FluxHelmRepo):
    c.execute(
      "INSERT INTO flux_helm_repo VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      (data.helm_repo_name, data.namespace, data.helm_repo_url, data.interval, data.repo_name, data.amount_lines, data.url, data.timestamp))

  
  def test(self, c) -> bool:
    c.execute("SELECT count(*) FROM flux_helm_repo")
    return c.fetchone()[0] > 1000