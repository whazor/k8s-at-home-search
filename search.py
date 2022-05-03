import os
import sqlite3
import sys
from typing import Any, List
from ruamel.yaml import YAML
from ruamel.yaml.error import YAMLError
import sqlite3
from subprocess import check_output
import warnings

from ruamel.yaml.error import ReusedAnchorWarning
from info_model import InfoModel

from scanners.flux_helm_release import FluxHelmReleaseScanner
from scanners.flux_helm_repo import FluxHelmRepoScanner
warnings.simplefilter("ignore", ReusedAnchorWarning)

# create sqlite db
conn = sqlite3.connect('repos.db')
c = conn.cursor()

c.execute("SELECT replace(repo_name, '/', '-'), repo_name FROM repo")
# to map
repos = dict(c.fetchall())
c.execute("SELECT repo_name, branch FROM repo")
branches = dict(c.fetchall())

yaml=YAML(typ="safe", pure=True)

scanners = [
  FluxHelmReleaseScanner(),
  FluxHelmRepoScanner()
]

for scanner in scanners:
  scanner.create_table(c)

for root, dirs, files in os.walk("repos/"):
  for file in files:
    file_path = os.path.join(root, file)
    if file.endswith(".yaml"):
      repo_dir_name = file_path.split('/')[1]
      if repo_dir_name not in repos:
        print("repo", repo_dir_name, "not found in repos")
        continue

      with open(file_path, "r") as stream:
        found_scanners = []
        try:
          for s in scanners:
            stream.seek(0)
            if s.pre_check(stream):
              found_scanners.append(s)
        except UnicodeDecodeError as e:
          print("unicode error", e) 
          continue
        if len(found_scanners) > 0:
          stream.seek(0)
          try:
            amount_lines = len(stream.readlines())
          except UnicodeDecodeError as e:
            print("unicode error", e) 
            continue
          stream.seek(0)
          try:
            docs: List[Any] = yaml.load_all(stream)
            def prepare_walk(doc: Any):
              def walk(path, check=lambda x: x):
                  cur = doc
                  keys = [key.replace('@', '.') for key in path.replace('\\.', '@').split('.')]
                  for key in keys:
                    if not isinstance(cur, dict) or key not in cur or cur[key] is None:
                      return False
                    cur = cur[key]
                  return check(cur)
              return walk
            for doc in docs:
              current_scanners = [
                s for s in found_scanners 
                  if s.check(prepare_walk(doc))]
              if len(current_scanners) > 0:
                cmd = "git log -1 --format=%ct -- "+ file_path.split("repos/"+repo_dir_name+"/")[1]
                timestamp = check_output(
                  cmd,
                  shell=True,
                  cwd="repos/" + repo_dir_name,
                )
                repo_name = repos[repo_dir_name]
                branch = branches[repo_name]
                url = "https://github.com/" + repo_name + "/blob/"+branch+"/" + file_path.split('/', 2)[2]
                rest = InfoModel(
                  repo_name=repos[repo_dir_name],
                  timestamp=timestamp.decode("utf-8").strip(),
                  url=url,
                  amount_lines=amount_lines,
                )
                for s in current_scanners:
                  result = s.parse(prepare_walk(doc), rest)
                  s.insert(c, result)
          except YAMLError as exc:
            print("yaml err")
            print(exc)
conn.commit()

for scanner in scanners:
  if not scanner.test(c):
    print("scanner", str(type(scanner)), "failed")
    sys.exit(1)

c.close()