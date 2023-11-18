#!/usr/bin/env groovy

pipeline {
    agent any
    environment {
        DOCKER_CRED = credentials('docker-login')
        DOCKER_USER = "${env.DOCKER_CRED_USR}"
        DOCKER_PASS = "${env.DOCKER_CRED_PSW}"
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
                    echo $env.DOCKER_USER
                }
            }
        }
        stage('deploy') {
            steps {
                script {
                    echo "Deploying the application"
                    sh 'ls -la'
                    sh 'docker -v'
                    sh 'docker pull nginx'
                    sshagent(['netcup-ssh']) {
                        java.lang.String dockerCMD = 'docker version'
                        echo "SSHing to netcup"
                        sh "ssh -o StrictHostKeyCHecking=no nghiemphan.de ${dockerCMD}"

                        withCredentials(
                                [usernamePassword(
                                        credentialsId: 'docker-login',
                                        usernameVariable: 'USER',
                                        passwordVariable: 'PASS'
                                )
                                ]) {
                            echo USER
                            echo PASS
                            def dockerLoginCMD = "echo $PASS | docker login -u $USER --password-stdin https://docker.nghiemphan.de/"
                            sh "ssh -o StrictHostKeyCHecking=no nghiemphan.de ${dockerLoginCMD}"
                        }
                    }
                }
            }
        }
    }
}
