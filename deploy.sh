#!/usr/bin/env bash

scp ./k8s/*.yaml nghiemphan.de:~/projects/takeawaybill/
ssh nghiemphan.de "kubectl apply -f ~/projects/takeawaybill/"
#docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t docker.nghiemphan.de/admin/takeawaybill-backend:latest -f ./backend/Dockerfile .
#docker buildx build --platform linux/amd64 -t docker.nghiemphan.de/admin/takeawaybill-backend:latest -f ./backend/Dockerfile .
#docker buildx build --platform linux/amd64,linux/arm64 -t docker.nghiemphan.de/admin/takeawaybill-backend:latest -f ./backend/Dockerfile . --load
#docker buildx build --platform linux/amd64 -t docker.nghiemphan.de/admin/takeawaybill-backend:latest -f ./backend/Dockerfile . --push

#docker buildx build --platform linux/amd64,linux/arm64 -t docker.nghiemphan.de/admin/takeawaybill-backend:latest -f ./backend/Dockerfile . --push
