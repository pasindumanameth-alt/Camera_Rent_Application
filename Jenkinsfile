pipeline {
    agent any

    environment {
        DOCKER_HUB_USER = "kvcn"
        FRONTEND_IMAGE = "kvcn/frontend-app"
        BACKEND_IMAGE = "kvcn/backend-app"
        GIT_REPO = "https://github.com/pasindumanameth-alt/Camera_Rent_Application.git"
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Pulling code from GitHub..."
                checkout([$class: 'GitSCM', branches: [[name: '*/main']], userRemoteConfigs: [[url: "${GIT_REPO}"]]])
                echo "Workspace contents after checkout:"
                sh "pwd && ls -la"
                sh "ls -la frontend/ || echo 'frontend dir not found'"
                sh "ls -la backend/ || echo 'backend dir not found'"
            }
        }

        stage('Build Docker Images') {
            steps {
                dir("frontend") {
                    echo "Frontend directory contents:"
                    sh "pwd && ls -la"
                    sh "cat Dockerfile | wc -c"
                    sh "file Dockerfile"
                    sh "head -20 Dockerfile"
                    echo "Building frontend Docker image: ${FRONTEND_IMAGE}:latest"
                    sh "sudo -n docker build -t ${FRONTEND_IMAGE}:latest ."
                }

                dir("backend") {
                    echo "Backend directory contents:"
                    sh "pwd && ls -la"
                    sh "cat Dockerfile | wc -c"
                    sh "file Dockerfile"
                    sh "head -20 Dockerfile"
                    echo "Building backend Docker image: ${BACKEND_IMAGE}:latest"
                    sh "sudo -n docker build -t ${BACKEND_IMAGE}:latest ."
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh """
                        echo "Logging into Docker Hub..."
                        echo \$DOCKER_PASS | sudo -n docker login -u \$DOCKER_USER --password-stdin
                        
                        echo "Pushing frontend image..."
                        sudo -n docker push ${FRONTEND_IMAGE}:latest
                        
                        echo "Pushing backend image..."
                        sudo -n docker push ${BACKEND_IMAGE}:latest
                    """
                }
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                echo "Starting containers using docker-compose..."
                sh 'sudo -n docker compose up -d'
            }
        }

        stage('Verify Deployment') {
            steps {
                echo "Checking running containers..."
                sh 'sudo -n docker ps'
            }
        }
    }

    post {
        always {
            sh "sudo -n docker logout || true"
        }
        failure {
            echo "❌ Pipeline failed. Check Docker permissions and credentials."
        }
        success {
            echo "✅ Pipeline completed successfully! Frontend and backend images pushed to Docker Hub and deployed."
        }
    }
}
