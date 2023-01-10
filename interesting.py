import requests
import os
import json
from datetime import datetime

github_header = {"content-type": "application/json"}
if "GITHUB_TOKEN" in os.environ:
    github_header["Authorization"] = "Bearer " + os.environ["GITHUB_TOKEN"]

repos = set()
results = []

items = []
page = 1
while len(items) > 0 or page == 1:
    items = requests.get(
        "https://api.github.com/search/repositories",
        params={"q": "topic:k8s-at-home", "per_page": 100, "page": page},
        headers=github_header,
    ).json()["items"]
    for repo_info in items:
        pushed_at = datetime.strptime(repo_info["pushed_at"], "%Y-%m-%dT%H:%M:%SZ")
        # filter out unmaintained repos
        if (datetime.now() - pushed_at).days > 90:
            continue
        repo_name = repo_info["full_name"]
        if "true_charts" in repo_name:
            # Skip true_charts, only charts no helm_release
            continue
        stars = repo_info["stargazers_count"]
        url = repo_info["html_url"]
        branch = repo_info["default_branch"]
        results.append((repo_name, url, branch, stars))
        repos.add(repo_name)
    page += 1

if len(results) < 50:
    print("Not enough repos, error fetching topic github repos")
    exit(1)

# sort results on repo_name
results = sorted(results, key=lambda x: x[0])

j = json.dumps(results, indent=2)
with open("repos.json", "w") as f:
    f.write(j)
