#!/bin/bash
docker rmi microfs:1.1 -f
docker build -t microfs:1.1 .
