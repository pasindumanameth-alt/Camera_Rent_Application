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
        stage('Build Frontend Image') {
            steps {
                // Print current workspace and list root contents
                sh 'pwd && ls -la'
                // Fail if frontend/Dockerfile does not exist
                sh '[ -f frontend/Dockerfile ] || (echo "ERROR: frontend/Dockerfile not found!" && exit 1)'
                dir('frontend') {
                    sh 'ls -la'
                    sh 'docker build -t pasindumanmeth/camerarent-new-frontend:${BUILD_NUMBER} .'
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    sh 'docker build -t pasindumanmeth/camerarent-new-backend:${BUILD_NUMBER} .'
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
                sh "docker push pasindumanmeth/camerarent-new-frontend:${BUILD_NUMBER}"
                sh "docker push pasindumanmeth/camerarent-new-backend:${BUILD_NUMBER}"
            }
        }
    }
    post {
        always {
            sh 'docker logout'
        }
    }
}