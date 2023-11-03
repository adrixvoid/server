### Node

```
$  node --version
$  nvm current
$  nvm install 20.9.0
$  nvm current
```

### Vite

```
$  npm create vite@latest
$  cd fiebre-web-vite/
$  npm install
$  npm run dev
$  code .
```

### Prisma
> Tutorial: https://www.youtube.com/watch?v=ESShhQmBjjY
```
$  npm install prisma --save-dev
$  npx prisma init
$  npm run dev
$  node --version
```

✔ Your Prisma schema was created at prisma/schema.prisma
  You can now open it in your favorite editor.

warn You already have a .gitignore file. Don't forget to add `.env` in it to not commit any private information.

Next steps:
1. Set the DATABASE_URL in the .env file to point to your existing database. If your database has no tables yet, read https://pris.ly/d/getting-started
2. Set the provider of the datasource block in schema.prisma to match your database: postgresql, mysql, sqlite, sqlserver, mongodb or cockroachdb.
3. Run prisma db pull to turn your database schema into a Prisma schema.
4. Run prisma generate to generate the Prisma Client. You can then start querying your database.

### NodeJS Server with Docker

```
$  npm init
$  npm i express mysql2 dotenv
$  node src/index.js
$  docker compose up
$  npm run start
```

### Docker config

**Docker compose:** Nos permite configurar los distintos contenedores/ambientes que necesitamos, web, server, mysql o database, etc...

**Dockerfile:** Nos permite especificar que queremos empaquetar: Ejecutar el instalador de `node_modules`, ejecutar `npm start`


Con esto se puede crear el contenedor de Node en Dockerfile

```
FROM node:18.16.0

WORKDIR /app
COPY package.json .
RUN npm install

COPY . .
CMD npm start
```


Construir este contenedor con el siguiente comando. nodemysql es un alias que le asigno

Crea imagen manualmente
```
$ docker build -t nodemysql .
```

Lista imagenes
```
$ docker images
```

Remueve imagen
```
$ docker rmi [IMAGE_ID]
```

Lista contenedores corriendo
```
docker compose ps
```

Baja el contenedor corriendo
```
docker compose down
```

Crea/Levanta los contenedores
```
docker compose up
```

Rebuild with some new config
```
docker compose up --build
```