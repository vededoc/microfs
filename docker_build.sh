#!/bin/bash
#docker rmi microfs:1.1 -f
docker build -t microfs:1.1 --build-arg DB_HOST=localhost --build-arg DB_PASSWORD=db_password .
