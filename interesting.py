
import requests
import os
import json

github_token = os.environ['GITHUB_TOKEN']
github_header = {'Authorization': 'Bearer '+github_token, 'content-type': 'application/json'}


results = []

url = "https://api.github.com/search/repositories?q=topic:k8s-at-home"
items = requests.get(url, headers=github_header).json()['items']

for repo_info in items:
    stars = repo_info['stargazers_count']
    repo_name = repo_info['full_name']
    url = repo_info['html_url']
    branch = repo_info['default_branch']
    results.append((repo_name, url, branch, stars))

j = json.dumps(results, indent=2)
with open('repos.json', 'w') as f:
    f.write(j)

