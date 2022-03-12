import os
import sqlite3
import yaml
import sys
import sqlite3
from subprocess import check_output
# find all .yaml files in repos/ dir

# check for "apiVersion: helm.toolkit.fluxcd.io/v2beta1"
api_version = "apiVersion: helm.toolkit.fluxcd.io"
# check for "kind: HelmRelease"
kind = "kind: HelmRelease"

# create sqlite db
conn = sqlite3.connect('repos.db')
c = conn.cursor()
# table name: charts
# fields: chart name, repo name, url, timestamp
c.execute('''DROP TABLE IF EXISTS charts''')
c.execute('''CREATE TABLE IF NOT EXISTS charts
              (release_name text NOT NULL, 
               chart_name text NOT NULL, 
               repo_name text NOT NULL, 
               hajimari_icon text NULL, 
               lines number NOT NULL,
               url text NOT NULL, 
               timestamp text NOT NULL)''')

c.execute("SELECT replace(repo_name, '/', '-'), repo_name FROM repos")
# to map
repos = dict(c.fetchall())
c.execute("SELECT repo_name, branch FROM repos")
branches = dict(c.fetchall())

for root, dirs, files in os.walk("repos/"):
  for file in files:
    if file.endswith(".yaml"):
      file_path = os.path.join(root, file)
      repo_dir_name = file_path.split('/')[1]
      if repo_dir_name not in repos:
        print("repo", repo_dir_name, "not found in repos")
        continue
      contains_api_version = False
      contains_kind = False
      with open(file_path, "r") as stream:
        try:
          for line in stream:
            if line.strip().startswith(api_version):
              contains_api_version = True
            if line.strip() == kind:
              contains_kind = True
        except UnicodeDecodeError as e:
          print("unicode error", e) 
          continue
        if contains_api_version and contains_kind:
          try:
            stream.seek(0)
            amount_lines = len(stream.readlines())
            stream.seek(0)
            for doc in yaml.safe_load_all(stream):
              def walk(path, check=lambda x: x):
                global doc
                cur = doc
                keys = [key.replace('@', '.') for key in path.replace('\\.', '@').split('.')]
                for key in keys:
                  if not key in cur or cur[key] is None:
                    return False
                  cur = cur[key]
                return check(cur)
              if walk('apiVersion', lambda x: x.startswith("helm.toolkit.fluxcd.io")) and \
                  walk('kind', lambda x: x == 'HelmRelease') and \
                  walk('spec.chart.spec.chart', lambda x: x is not None) and \
                  walk('spec.chart.spec.sourceRef.kind', lambda x: x == "HelmRepository"):
                chart_name = walk('spec.chart.spec.chart')
                release_name = walk('metadata.name')
                
                hajimari_icon = walk(
                  'spec.values.ingress.main.annotations.hajimari\.io/icon',
                  lambda x: x.strip()) or None

                repo_name = repos[repo_dir_name]
                cmd = "git log -1 --format=%ct -- "+ file_path.split("repos/"+repo_dir_name+"/")[1]
                timestamp = check_output(
                  cmd,
                  shell=True,
                  cwd="repos/" + repo_dir_name,
                )
                timestamp = timestamp.decode('utf-8').strip()
                branch = branches[repo_name]
                url = "https://github.com/" + repo_name + "/blob/"+branch+"/" + file_path.split('/', 2)[2]
                c.execute("INSERT INTO charts VALUES (?, ?, ?, ?, ?, ?, ?)", (release_name, chart_name, repo_name, hajimari_icon, amount_lines, url, timestamp))
          except yaml.YAMLError as exc:
            print(exc)
conn.commit()
c.close()