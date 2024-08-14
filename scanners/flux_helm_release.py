import json
from typing import Optional

from info_model import InfoModel

# release_name, chart_name, repo_name, hajimari_icon, amount_lines, url, timestamp

class FluxHelmRelease(InfoModel):
  release_name: str
  chart_name: str
  chart_version: Optional[str]
  namespace: Optional[str]
  hajimari_icon: Optional[str]
  hajimari_group: Optional[str]
  helm_repo_name: str
  helm_repo_namespace: Optional[str]
  values: Optional[str]

class FluxHelmReleaseScanner:
  api_version = "helm.toolkit.fluxcd.io"
  kind = "HelmRelease"
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
      walk('spec.chart.spec.chart', lambda x: x is not None) and \
      walk('spec.chart.spec.sourceRef.kind', lambda x: x == "HelmRepository" or x == "GitRepository")

  def parse(self, walk, rest: InfoModel) -> FluxHelmRelease:
    chart_name = walk('spec.chart.spec.chart')
    chart_version = walk('spec.chart.spec.version')
    release_name = walk('metadata.name')
    namespace = walk('metadata.namespace')
    helm_repo_name = walk('spec.chart.spec.sourceRef.name')
    helm_repo_namespace = walk('spec.chart.spec.sourceRef.namespace')
    values = walk('spec.values')
    
    
    hajimari_icon = walk(
      'spec.values.ingress.main.annotations.hajimari\.io/icon',
      lambda x: x.strip()) or None
    hajimari_group = walk(
      'spec.values.ingress.main.annotations.hajimari\.io/group',
      lambda x: x.strip()) or None

    return FluxHelmRelease.parse_obj(rest.dict() | {
      'chart_name': chart_name,
      'chart_version': chart_version,
      'release_name': release_name,
      'hajimari_icon': hajimari_icon,
      'hajimari_group': hajimari_group,
      'namespace': namespace,
      'helm_repo_name': helm_repo_name,
      'helm_repo_namespace': helm_repo_namespace,
      'values': json.dumps(values, default=str)
    })

  def create_table(self, c1, c2):
    c1.execute('''DROP TABLE IF EXISTS flux_helm_release''')
    c1.execute('''CREATE TABLE IF NOT EXISTS flux_helm_release
                  (release_name text NOT NULL, 
                  chart_name text NOT NULL, 
                  chart_version text NULL,
                  namespace text NULL,
                  repo_name text NOT NULL, 
                  hajimari_icon text NULL, 
                  hajimari_group text NULL,
                  lines number NOT NULL,
                  url text NOT NULL, 
                  timestamp text NOT NULL,
                  helm_repo_name text NOT NULL,
                  helm_repo_namespace text NULL)''')
    # in second DB, store the val longtext. create table in first db for later copying
    for c in [c1, c2]:
        c.execute('''DROP TABLE IF EXISTS flux_helm_release_values''')
        c.execute('''CREATE TABLE IF NOT EXISTS flux_helm_release_values
                  (url text NOT NULL, val longtext null)''')

  def insert(self, c1, c2, data: FluxHelmRelease):
    c1.execute(
      "INSERT INTO flux_helm_release VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      (
        data.release_name, 
        data.chart_name, 
        data.chart_version,
        data.namespace,
        data.repo_name, 
        data.hajimari_icon, 
        data.hajimari_group,
        data.amount_lines, 
        data.url, 
        data.timestamp,
        data.helm_repo_name, 
        data.helm_repo_namespace,))
    c2.execute("INSERT INTO flux_helm_release_values VALUES (?, ?)",
      (
          data.url,
          data.values
      ))
  
  def test(self, c1, c2) -> bool:
    c1.execute("SELECT count(*) FROM flux_helm_release")
    c = c1.fetchone()[0]
    print("flux_helm_release count", c)
    return c > 100
