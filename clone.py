# #!/bin/bash
# git submodule init
# # add as submodule
# eval "$(sqlite3 repos.db 'select "git submodule add " ||url || " repos/" || REPLACE(repo_name, "/", "-") from repos')"

# # git config pull.ff only
# # find repos -type d -depth 1 -exec git --git-dir={}/.git --work-tree=$PWD/{} pull \;
# git submodule foreach git config --local pull.ff only
# git submodule foreach git pull 
from re import sub
import subprocess
import os
import sqlite3

conn = sqlite3.connect('repos.db')
c = conn.cursor()
c.execute("""
SELECT 
  replace(repo_name, '/', '-') as dir_name, 
  branch,
  url
FROM repos
""")
repos = c.fetchall()

dirs = set(map(lambda x: x[0], repos))
urls_map = {x[0]: x[2] for x in repos}
# print(repos)

# execute "git submodule status"
res = subprocess.run(["git", "submodule", "status"], capture_output=True, text=True)

print(dirs)
print(len(dirs))
existing = set()
has_deleted = False
for line in res.stdout.splitlines():
  repo = line.strip().split(" ")[1].removeprefix("repos/")
  if repo not in dirs:
    subprocess.run(["git", "rm", "-f", "repos/" + repo])
    has_deleted = True
  else:
    existing.add(repo)

if has_deleted:
  # git commit -m "Removed submodule"
  subprocess.run(["git", "commit", "-m", "Removed submodule"])

has_added = False
# add new submodules
to_add = dirs - existing
for repo in to_add:
  subprocess.run(["git", "submodule", "add", urls_map[repo], "repos/" + repo])
  has_added = True

# git submodule foreach git config --local pull.ff only
# git submodule foreach git pull 
subprocess.run(["git", "submodule", "foreach", "git", "config", "--local", "pull.ff", "only"])
subprocess.run(["git", "submodule", "foreach", "git", "pull"])
if has_added:
  # git commit -m "Added submodule"
  subprocess.run(["git", "commit", "-m", "Added submodule"])
