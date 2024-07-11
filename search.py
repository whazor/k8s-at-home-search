import os
import sqlite3
import sys
from typing import Any, List
from ruamel.yaml import YAML
from ruamel.yaml.error import YAMLError
import sqlite3
from subprocess import check_output
import warnings
from urllib.parse import urlparse
import shlex

from ruamel.yaml.error import ReusedAnchorWarning
from info_model import InfoModel
from pydantic import ValidationError

from scanners.flux_helm_release import FluxHelmReleaseScanner
from scanners.flux_helm_repo import FluxHelmRepoScanner
warnings.simplefilter("ignore", ReusedAnchorWarning)

# create sqlite db
conn1 = sqlite3.connect('repos.db')
conn2 = sqlite3.connect('repos-extended.db')
c1 = conn1.cursor()
c2 = conn2.cursor()

c1.execute("SELECT replace(repo_name, '/', '-'), url FROM repo")
# to map
repos = dict(c1.fetchall())
c1.execute("SELECT replace(repo_name, '/', '-'), branch FROM repo")
branches = dict(c1.fetchall())

yaml=YAML(typ="safe", pure=True)

scanners = [
  FluxHelmReleaseScanner(),
  FluxHelmRepoScanner()
]

for scanner in scanners:
  scanner.create_table(c1, c2)

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
                      return None
                    cur = cur[key]
                  return check(cur)
              return walk
            for doc in docs:
              current_scanners = [
                s for s in found_scanners 
                  if s.check(prepare_walk(doc))]
              if len(current_scanners) > 0:
                rel_file_path = os.path.relpath(file_path, "repos/"+repo_dir_name+"/")
                safe_file_path = shlex.quote(rel_file_path)
                cmd = f"git log -1 --format=%ct -- {safe_file_path}"
                timestamp = check_output(
                  cmd,
                  shell=True,
                  cwd="repos/" + repo_dir_name,
                )
                url = repos[repo_dir_name]
                
                branch = branches[repo_dir_name]
                full_url = f"{url}/blob/{branch}/{os.path.relpath(file_path, 'repos/' + repo_dir_name + '/')}"
                repo_name = urlparse(url).path[1:]

                rest = InfoModel(
                  repo_name=repo_name,
                  timestamp=timestamp.decode("utf-8").strip(),
                  url=full_url,
                  amount_lines=amount_lines,
                )
                for s in current_scanners:
                  try:
                    result = s.parse(prepare_walk(doc), rest)
                    s.insert(c1, c2, result)
                  except ValidationError as e:
                    print("validation error", e)
          except YAMLError as exc:
            print("yaml err")
            print(exc)
conn1.commit()
conn2.commit()

for scanner in scanners:
  if not scanner.test(c1, c2):
    print("scanner", str(type(scanner)), "failed")
    sys.exit(1)

c1.close()
c2.close()
