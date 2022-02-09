# k8s at home search (unofficial)
Search Flux HelmReleases through [awesome k8s-at-home](https://github.com/k8s-at-home/awesome-home-kubernetes) projects, check it out at https://whazor.github.io/k8s-at-home-search/

<img width="848" alt="image" src="https://user-images.githubusercontent.com/184182/152700148-2f41a576-7ae4-4ed5-b14c-840347787036.png">

<img width="848" alt="image" src="https://user-images.githubusercontent.com/184182/152700157-b9c79d7b-d793-4bb9-b422-d3ed882b4035.png">

## development

Updating `repos.json` (not necessary):
```
pip3 install requests
python3 interesting.py
```

Updating `repos/` submodules:
```
./clone.sh
```

Setting up `repos.db`:
```
python3 init-db.py
python3 search.py
```

You could also download `repos.db` from releases https://github.com/Whazor/k8s-at-home-search/releases/

Setting up the frontend/
```
mkdir -p frontend/dist/
wget https://github.com/sql-js/sql.js/releases/download/v1.6.2/sqljs-worker-wasm.zip
unzip sqljs-worker-wasm.zip -d frontend/dist/

cp repos.db frontend/dist/

cd frontend/
yarn install
yarn run start
```
