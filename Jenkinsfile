pipeline {
    agent any

    environment {
        FRONTEND_IMAGE = "kvcn/frontend-app"
        BACKEND_IMAGE = "kvcn/backend-app"
        GIT_REPO = "https://github.com/pasindumanameth-alt/Camera_Rent_Application.git"
    }

    stages {
        stage('Clone Repository') {
            steps {
                // checkout main branch explicitly
                checkout([$class: 'GitSCM', branches: [[name: '*/main']], userRemoteConfigs: [[url: "${GIT_REPO}"]]])
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                script {
                    // Build the frontend image using the frontend Dockerfile at frontend/Dockerfile
                    sh "docker build -t ${FRONTEND_IMAGE}:latest -f frontend/Dockerfile frontend"
                }
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                script {
                    // Build the backend image using the backend/Dockerfile
                    sh "docker build -t ${BACKEND_IMAGE}:latest -f backend/Dockerfile backend"
                }
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    sh "docker push ${FRONTEND_IMAGE}:latest"
                    sh "docker push ${BACKEND_IMAGE}:latest"
                }
            }
        }
    }

    post {
        always {
            sh "docker logout"
        }
    }
}
