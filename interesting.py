import requests
import os
import json
from datetime import datetime

github_header = {"content-type": "application/json"}
if "GITHUB_TOKEN" in os.environ:
    github_header["Authorization"] = "Bearer " + os.environ["GITHUB_TOKEN"]
else:
    print("Missing GITHUB_TOKEN")
    print("try: set -x GITHUB_TOKEN $(gh auth token)")
    print("or: export GITHUB_TOKEN=$(gh auth token)")
    exit(1)

isDry = os.environ.get("DRY_RUN", "false") == "true"

results = dict()

topics = ["k8s-at-home", "kubesearch"]

# first read all repos from repos.json
with open("repos.json", "r") as f:
    for repo in json.load(f):
        key = repo[0].lower()
        # only add if not already in results or if it has more stars
        if key not in results or repo[3] > results[key][3]:
            results[key] = repo

items = []
page = 1
for topic in topics:
    if isDry:
        break
    while len(items) > 0 or page == 1:
        result = requests.get(
            "https://api.github.com/search/repositories",
            params={"q": "topic:"+topic, "per_page": 100, "page": page},
            headers=github_header,
        ).json()
        items = result["items"] if "items" in result else []
        for repo_info in items:
            pushed_at = datetime.strptime(repo_info["pushed_at"], "%Y-%m-%dT%H:%M:%SZ")
            # filter out unmaintained repos
            if (datetime.now() - pushed_at).days > 90:
                continue
            repo_name = repo_info["full_name"]
            key = repo_name.lower()
            stars = repo_info["stargazers_count"]
            url = repo_info["html_url"]
            branch = repo_info["default_branch"]
            if key in results and stars < results[key][3]:
                continue
            results[key] = (repo_name, url, branch, stars)
        page += 1

# graphql query to get all repos from github, as their api is unreliable
def run_graphql_query(topic, variables):
    query = """
    query ($cursor: String) {
      topic(name: \"%s\") {
        repositories(first: 100, after: $cursor) {
          pageInfo {
            endCursor
            startCursor
          }
          nodes {
            id
            nameWithOwner
            stargazerCount
            url
            defaultBranchRef {
              name
            }
            pushedAt
          }
        }
      }
    }""" % topic
    payload = {"query": query, "variables": variables}
    response = requests.post("https://api.github.com/graphql", json=payload, headers=github_header)
    return response.json()

for topic in topics:
    if isDry:
        break
    cursor = None
    has_next_page = True
    while has_next_page:
        variables = {"cursor": cursor}
        result = run_graphql_query(topic, variables)
        nodes = result["data"]["topic"]["repositories"]["nodes"]
        for repo in nodes:
            pushed_at = datetime.strptime(repo["pushedAt"], "%Y-%m-%dT%H:%M:%SZ")
            # filter out unmaintained repos
            if (datetime.now() - pushed_at).days > 90:
                continue
            repo_name = repo["nameWithOwner"]
            key = repo_name.lower()
            stars = repo["stargazerCount"]
            url = repo["url"]
            branch = repo["defaultBranchRef"]["name"]
            if key in results and stars < results[key][3]:
                continue
            results[repo_name] = (repo_name, url, branch, stars)
        has_next_page = result["data"]["topic"]["repositories"]["pageInfo"]["endCursor"]
        cursor = result["data"]["topic"]["repositories"]["pageInfo"]["endCursor"]

for topic in topics:
    if isDry:
        break
    url = "https://gitlab.com/api/v4/projects?topic="+topic
    items = requests.get(url).json()
    for repo_info in items:
        pushed_at = datetime.strptime(repo_info["last_activity_at"], "%Y-%m-%dT%H:%M:%S.%fZ")
        # filter out unmaintained repos
        if (datetime.now() - pushed_at).days > 90:
            continue
        repo_name = repo_info["path_with_namespace"]
        key = repo_name.lower()
        stars = repo_info["star_count"]
        url = repo_info["web_url"]
        branch = repo_info["default_branch"]
        if key in results and stars < results[key][3]:
            continue
        results[key] = (repo_name, url, branch, stars)


# check if all must_have repos are in results
must_have = {
    "onedr0p/home-ops",
    "billimek/k8s-gitops",
    "xunholy/k8s-gitops",
    "bjw-s/home-ops",
    "wrmilling/k3s-gitops",
    "carpenike/k8s-gitops",
    "truxnell/home-cluster",
    "brettinternet/homelab",
    "angelnu/k8s-gitops",
    "anthr76/infra"
}

filter_out = [
    "true_charts",
    "truecharts"
]

results = {k: v for k, v in results.items() if not any(filter_text in k for filter_text in filter_out)}

for repo in must_have:
    if repo not in results:
        print(f"Missing {repo}")
        exit(1)

if len(results) < 50:
    print("Not enough repos, error fetching topic github repos")
    exit(1)



# sort results on repo_name
results = sorted(results.values(), key=lambda x: x[0])

j = json.dumps(results, indent=2)
with open("repos.json", "w") as f:
    f.write(j)
