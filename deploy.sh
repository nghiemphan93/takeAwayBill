#!/usr/bin/env bash

scp ./k8s/*.yaml nghiemphan.de:~/projects/takeawaybill/
ssh nghiemphan.de "kubectl apply -f ~/projects/takeawaybill/"
#docker build -t docker.nghiemphan.de/admin/takeawaybill-backend:latest -f ./backend/Dockerfile .
