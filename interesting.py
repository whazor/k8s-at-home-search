
import requests
import os
import json
import sys
repos_url = "https://raw.githubusercontent.com/k8s-at-home/awesome-home-kubernetes/main/data.json"
data = requests.get(repos_url).json()

github_token = os.environ['GITHUB_TOKEN']
github_header = {'Authorization': 'Bearer '+github_token, 'content-type': 'application/json'}

repos = set()
for repo in data['user_repositories']:
    # if flux
    if 'gitops_tool' in repo and repo['gitops_tool'] == 'flux':
        name = repo['repo']
        url = "https://github.com/" + name
        repos.add((name, url))


for repo in requests.get('https://api.github.com/repos/k8s-at-home/template-cluster-k3s/forks', headers=github_header).json():
    repos.add((repo['full_name'], repo['html_url']))


results = []

for repo_name, url in repos:
    repo_info = requests.get('https://api.github.com/repos/'+repo_name, headers=github_header).json()
    if 'stargazers_count' in repo_info and 'default_branch' in repo_info:
        stars = repo_info['stargazers_count']
        branch = repo_info['default_branch']
        # insert or update
        results.append((repo_name, url, branch, stars))


j = json.dumps(results)
with open('repos.json', 'w') as f:
    f.write(j)
