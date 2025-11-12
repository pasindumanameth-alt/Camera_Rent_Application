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
                    echo "Building frontend Docker image: ${FRONTEND_IMAGE}:latest"
                    sh "cd frontend && sudo -n docker build -t ${FRONTEND_IMAGE}:latest -f Dockerfile ."
                }
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                script {
                    // Build the backend image using the backend/Dockerfile
                    echo "Building backend Docker image: ${BACKEND_IMAGE}:latest"
                    sh "cd backend && sudo -n docker build -t ${BACKEND_IMAGE}:latest -f Dockerfile ."
                }
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo "Logging in to Docker Hub..."
                        echo "$DOCKER_PASS" | sudo -n docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    echo "Pushing frontend image: ${FRONTEND_IMAGE}:latest"
                    sh "sudo -n docker push ${FRONTEND_IMAGE}:latest"
                    echo "Pushing backend image: ${BACKEND_IMAGE}:latest"
                    sh "sudo -n docker push ${BACKEND_IMAGE}:latest"
                }
            }
        }
    }

    post {
        always {
            sh "sudo -n docker logout || true"
        }
        failure {
            echo "Pipeline failed. Check Docker permissions and credentials."
        }
        success {
            echo "Pipeline completed successfully. Images pushed to Docker Hub."
        }
    }
}
