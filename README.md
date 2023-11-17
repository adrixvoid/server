# How to run

> Required to have installed docker in the O.S.

### Config .env file
Copy and rename the file ``.env-sample`` and add the required configuration per each container

### Run container

```
docker compose up
```

Rebuild (if there are some new config)
```
docker compose up --build
```

# Notes

### Docker config

**Docker compose:** 
Allows us to configure different containers, web, server, mysql, database, etc.

**Dockerfile:** 
Allows us to specify different configurations per container, for example:
- Dockerfile-server
- Dockerfile-media
- Dockerfile-email

Example configuration of `Dockerfile` file

```
FROM node:18.16.0

WORKDIR /app
COPY ./media/package.json .
RUN npm install

COPY ./media .
CMD npm start
```


Construir este contenedor con el siguiente comando. nodemysql es un alias que le asigno

Create docker image
```
$ docker build -t nodemysql .
```

List docker images
```
$ docker images
```

Remove a docker image
```
$ docker rmi [IMAGE_ID]
```

List containers up and running
```
docker compose ps
```

Down all running containers
```
docker compose down
```

Run the container
```
docker compose up
```

Rebuild with some new config
```
docker compose up --build
```

Enter to the container
```
docker ps (see the container id)
docker exec -it [CONTAINERID]
```