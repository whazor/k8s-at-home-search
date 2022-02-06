# k8s at home search (unofficial)
under development, still have to make pipeline and github site

<img width="848" alt="image" src="https://user-images.githubusercontent.com/184182/152700148-2f41a576-7ae4-4ed5-b14c-840347787036.png">

<img width="848" alt="image" src="https://user-images.githubusercontent.com/184182/152700157-b9c79d7b-d793-4bb9-b422-d3ed882b4035.png">

## development
needs github tokens for getting stars (GITHUB_USER, GITHUB_TOKEN). But in github actions this will be provider
for us.

```
pip3 install requests
python3 interesting.py
./clone.sh
python3 search.py
```
build frontend
```
cd frontend/
yarn install
yarn run start
```