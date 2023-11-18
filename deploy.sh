#!/usr/bin/env bash

scp ./k8s/*.yaml nghiemphan.de:~/projects/takeawaybill/
ssh nghiemphan.de "kubectl apply -f ~/projects/takeawaybill/"
