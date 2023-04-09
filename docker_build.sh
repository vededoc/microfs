#!/bin/bash
#docker rmi microfs:1.1 -f
docker build -t microfs:1.1 --build-arg DB_HOST=192.168.5.2 --build-arg DB_PASSWORD='New1234!@'  .
