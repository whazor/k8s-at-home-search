# k8s at home search (unofficial)
Search Flux HelmReleases through [awesome k8s-at-home](https://github.com/k8s-at-home/awesome-home-kubernetes) projects, check it out at https://whazor.github.io/k8s-at-home-search/

<img width="848" alt="image" src="https://user-images.githubusercontent.com/184182/152700148-2f41a576-7ae4-4ed5-b14c-840347787036.png">

<img width="848" alt="image" src="https://user-images.githubusercontent.com/184182/152700157-b9c79d7b-d793-4bb9-b422-d3ed882b4035.png">

## development
Overview:
[![](https://mermaid.ink/img/pako:eNqF0LFuwyAQBuBXsW623Z2hUztE6tSOpsMZzoHKHBYcQxTn3UvsJO1QqQxw_PpAcGcw0RIoOCZcXPP2rrmp4zB4FkqUxfOxX06ft7jrntdES8z9V468HthLlV46O_5S1-AB7aiarVrNHJmGbe6z-wdnwmTcbrYjD_TU5DKGaMtMdzbsy88T9v0f97bGYZK8TinWD7LduWZoIVAK6G3txfmaahBHgTSoWlqasMyiQfOl0rJYFHq1XmICNeGcqQUsEj9ObEBJKnRHLx5ra8NNXb4B_ROAjA)](https://mermaid.live/edit/#pako:eNqF0LFuwyAQBuBXsW623Z2hUztE6tSOpsMZzoHKHBYcQxTn3UvsJO1QqQxw_PpAcGcw0RIoOCZcXPP2rrmp4zB4FkqUxfOxX06ft7jrntdES8z9V468HthLlV46O_5S1-AB7aiarVrNHJmGbe6z-wdnwmTcbrYjD_TU5DKGaMtMdzbsy88T9v0f97bGYZK8TinWD7LduWZoIVAK6G3txfmaahBHgTSoWlqasMyiQfOl0rJYFHq1XmICNeGcqQUsEj9ObEBJKnRHLx5ra8NNXb4B_ROAjA)

You could download `repos.db` from releases https://github.com/Whazor/k8s-at-home-search/releases/

**To build repos.db**

Updating `repos.json` (can be skipped, already included in source):
```
pip3 install requests
python3 interesting.py
```

Setting up `repos.db` repos table:
```
python3 init-db.py
```

Updating `repos/` submodules (requires repo.db):
```
./clone.sh
```

Setting up `repos.db` charts table:
```
python3 search.py
```

**Setting up the frontend**

```
mkdir -p frontend/dist/
wget https://github.com/sql-js/sql.js/releases/download/v1.6.2/sqljs-worker-wasm.zip
unzip sqljs-worker-wasm.zip -d frontend/dist/

cp repos.db frontend/dist/

cd frontend/
yarn install
yarn run start
```

### tables

**Repos**
| **column name** | repo_name        | url                                | branch          | stars   |
|-----------------|------------------|------------------------------------|-----------------|---------|
| **value**       | text primary key | text                               | text            | integer |
| **example**     | user-reponame    | "https://github.com/user/reponame" | main/master/... | 42      |

**Charts**
| **column name** | chart_name | repo_name     | url                                                                 | hajimari_icon | timestamp  |
|-----------------|------------|---------------|---------------------------------------------------------------------|---------------|------------|
| **value**       | text       | text          | text                                                                | text null     | integer    |
| **example**     | plex       | user-reponame | "https://github.com/user/reponame/.../../traefik/helm-release.yaml" | tv            | 1644404532 |
