pipeline {
    agent any
    
    stages {
        stage('SCM Checkout') {
            steps {
                retry(3) {
                    git branch: 'main', url: 'https://github.com/pasindumanameth-alt/Camera_Rent_Application.git'
                }
            }
        }
        stage('Build Docker Image') {
            steps {
                dir('frontend') {
                    sh 'docker build -t pasindumanmeth/camerarent-new:${BUILD_NUMBER} .'
                }
            }
        }


        stage('Login to Docker Hub') {
            steps {
                withCredentials([string(credentialsId: 'dockerhubpassword', variable: 'dockerhubpassword')]) {
                    script {  
                        sh "docker login -u pasindumanmeth -p '${dockerhubpassword}'"
                    }
                }
            }
        }
        stage('Push Image') {
            steps {
                sh "docker push pasindumanmeth/camerarent-new:${BUILD_NUMBER}"
           
            }
        }
    }
    post {
        always {
            sh 'docker logout'
        }
    }
}