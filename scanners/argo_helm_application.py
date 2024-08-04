from info_model import InfoModel
from typing import Optional
import json


class ArgoHelmApplication(InfoModel):
    release_name: str
    chart_name: str
    chart_version: Optional[str]
    namespace: Optional[str]
    hajimari_icon: Optional[str]
    values: Optional[str]
    helm_repo_url: str


class ArgoHelmApplicationScanner:
    api_version = "argoproj.io"
    kind = "Application"

    def pre_check(self, stream) -> bool:
        try:
            contains_api_version = False
            contains_kind = False
            contains_helm = False
            for line in stream:
                if line.strip().startswith("apiVersion: " + self.api_version):
                    contains_api_version = True
                if line.strip() == "kind: " + self.kind:
                    contains_kind = True
                if line.strip() == "helm:":
                    contains_helm = True
                if contains_api_version and contains_kind and contains_helm:
                    return True
        except UnicodeDecodeError as e:
            print("unicode error", e)
            return False

    def check(self, walk) -> bool:
        return walk('apiVersion', lambda x: x.startswith(self.api_version)) and \
            walk('kind', lambda x: x == self.kind) and \
            walk('spec.source.repoURL', lambda x: x is not None) and \
            walk('spec.source.chart', lambda x: x is not None)

    def parse(self, walk, rest: InfoModel) -> ArgoHelmApplication:
        chart_name = walk('spec.source.chart')
        chart_version = walk('spec.source.targetRevision')
        release_name = walk('metadata.name')
        namespace = walk('spec.destination.namespace')
        helm_repo_url = walk('spec.source.repoURL')
        values = walk('spec.source.helm.valuesObject')

        hajimari_icon = walk(
            'spec.source.helm.valuesObject.ingress.main.annotations.hajimari\.io/icon',
            lambda x: x.strip()) or None
        return ArgoHelmApplication.parse_obj(rest.dict() | {
            'chart_name': chart_name,
            'chart_version': chart_version,
            'release_name': release_name,
            'hajimari_icon': hajimari_icon,
            'namespace': namespace,
            'helm_repo_url': helm_repo_url,
            'values': json.dumps(values, default=str)
        })

    def create_table(self, c1, c2):
        c1.execute('''DROP TABLE IF EXISTS argo_helm_application''')
        c1.execute('''CREATE TABLE IF NOT EXISTS argo_helm_application(
                      release_name text NOT NULL, 
                      chart_name text NOT NULL, 
                      chart_version text NULL,
                      namespace text NULL,
                      hajimari_icon text NULL, 
                      lines number NOT NULL,
                      url text NOT NULL, 
                      timestamp text NOT NULL,
                      helm_repo_url text NOT NULL)''')
        # in second DB, store the val longtext. create table in first db for later copying
        for c in [c1, c2]:
            c.execute('''DROP TABLE IF EXISTS argo_helm_application_values''')
            c.execute('''CREATE TABLE IF NOT EXISTS argo_helm_application_values
                      (url text NOT NULL, val longtext null)''')

    def insert(self, c1, c2, data: ArgoHelmApplication):
        c1.execute(
            "INSERT INTO argo_helm_application VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                data.release_name,
                data.chart_name,
                data.chart_version,
                data.namespace,
                data.hajimari_icon,
                data.amount_lines,
                data.url,
                data.timestamp,
                data.helm_repo_url))
        c2.execute("INSERT INTO argo_helm_application_values VALUES (?, ?)",
                   (
                       data.url,
                       data.values
                   ))

    def test(self, c1, c2) -> bool:
        c1.execute("SELECT count(*) FROM argo_helm_application")
        return c1.fetchone()[0] > 1600
