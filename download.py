from re import sub
import subprocess
import sqlite3

def bash_command(cmd):
    subprocess.Popen(['bash', '-c', cmd])

conn = sqlite3.connect('repos.db')
c = conn.cursor()
c.execute("""
SELECT 
  replace(repo_name, '/', '-') as dir_name, 
  branch,
  url
FROM repo
""")
repos = c.fetchall()

# mkdir repos
subprocess.run(['mkdir', 'repos'])

for repo in repos:
  dir_name, branch, url = repo
  print("downloading "+dir_name+" "+branch+" "+url)
  # max 1 year
  bash_command(f'rm -rf repos/{dir_name}; git clone {url} repos/{dir_name} --branch {branch} --filter=blob:limit=1m --single-branch --shallow-since="1 year"')

print('')
print('')

print("done")
