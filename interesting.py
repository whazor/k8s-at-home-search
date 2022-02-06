import sqlite3
import requests
import os
# create sqlite db
conn = sqlite3.connect('frontend/dist/repos.db')
c = conn.cursor()
# create table if not exists
# table name: repos
# fields: repo name, url, stars
# primary key repo_name
c.execute('''CREATE TABLE IF NOT EXISTS repos
                (repo_name text primary key, url text, branch text, stars integer)''')
repos_url = "https://raw.githubusercontent.com/k8s-at-home/awesome-home-kubernetes/main/data.json"

data = requests.get(repos_url).json()

repos = []
for repo in data['user_repositories']:
    # if flux
    if 'gitops_tool' in repo and repo['gitops_tool'] == 'flux':
        name = repo['repo']
        url = "https://github.com/" + name
        repos.append((name, url))

results = []
github_token = os.environ['GITHUB_TOKEN']
github_user = os.environ['GITHUB_USER']
for repo_name, url in repos:
    repo_info = requests.get('https://api.github.com/repos/'+repo_name, auth=(github_user, github_token)).json()
    if 'stargazers_count' in repo_info and 'default_branch' in repo_info:
        stars = repo_info['stargazers_count']
        branch = repo_info['default_branch']
        # insert or update
        c.execute("INSERT OR REPLACE INTO repos VALUES (?, ?, ?, ?)", (repo_name, url, branch, stars))
conn.commit()
c.close()