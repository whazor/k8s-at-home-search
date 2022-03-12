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


def bash_command(cmd):
    subprocess.Popen(['/bin/bash', '-c', cmd])

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

# print(repos)

# mkdir repos
subprocess.run(['mkdir', 'repos'])

for repo in repos:
  dir_name, branch, url = repo
  bash_command('mkdir repos/'+dir_name)
  tarball_url = url + '/tarball/' + branch
  bash_command('git clone '+url+' repos/'+dir_name+' --branch '+branch+' --single-branch --depth 1')

print('')
print('')

print("done")