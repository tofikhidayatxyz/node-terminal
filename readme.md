# Node Terminal
 This repository is to control the server on the server by using the website

## Installation
- Instal [NodejS](https://nodejs.org/)
- Pull from this repository
- Npm
```
 npm install
```
Or
```
yarn install
```
- Install pm2
```
npm i pm2 -g
```

- Bash
```
 cp .env.example .env
```


- Change .env Fiile

AUTH_USER = Credential for login // Example "Hefo"

AUTH_PASSWORD = Password for login // Password "Hefo19"


Change host and port if you need

- Add to pm2 services
```
pm2 start ./app.js
```


