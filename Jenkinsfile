#!/usr/bin/env groovy

pipeline {
    agent any
    environment {
        DOCKER_CRED = credentials('DOCKER_USERNAME_PASS')
        DOCKER_USER = "${DOCKER_CRED_USR}"
        DOCKER_PASS = "${DOCKER_CRED_PSW}"
        dockerLoginCMD = "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin https://docker.nghiemphan.de/"
    }

    stages {
        stage('test') {
            when {
                expression {
                    true
                }
            }
            steps {
                script {
                    echo "Testing the application..."
                }
            }
        }
        stage('build') {
            steps {
                script {
                    echo "Building the application..."
                    echo "$DOCKER_USER"
                    echo "$DOCKER_PASS"
                    sh "${dockerLoginCMD}"
                    sh "docker build -t docker.nghiemphan.de/admin/takeawaybill-backend:latest -f ./backend/Dockerfile ."
                    sh "docker push docker.nghiemphan.de/admin/takeawaybill-backend:latest"
                }
            }
        }
        stage('deploy') {
            steps {
                script {
                    echo "Deploying the application..."
                    sh 'ls -la'
                    sh 'docker -v'
                    sshagent(['VM_USERNAME_PRIVATE_KEY']) {
                        def dockerCMD = 'docker version'
                        echo "SSHing to vm"
                        sh "ssh -o StrictHostKeyChecking=no root@nghiemphan.de ${dockerCMD}"

                        withCredentials(
                                [usernamePassword(
                                        credentialsId: 'DOCKER_USERNAME_PASS',
                                        usernameVariable: 'USER',
                                        passwordVariable: 'PASS'
                                )
                        ]) {
                            echo USER
                            echo PASS
                            sh "ssh -o StrictHostKeyChecking=no root@nghiemphan.de ${dockerLoginCMD}"
                            sh "scp ./k8s/*.yaml root@nghiemphan.de:~/projects/takeawaybill/"
                            deployK8sCMD = "kubectl apply -f ~/projects/takeawaybill/"
                            sh "ssh -o StrictHostKeyChecking=no root@ghiemphan.de ${deployK8sCMD}"
                        }
                    }
                }
            }
        }
    }
}
