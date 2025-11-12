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
                checkout scm
                echo "============ WORKSPACE DIAGNOSTICS ============"
                sh "pwd"
                sh "echo 'Full directory tree:' && tree -L 3 2>/dev/null || find . -maxdepth 3 -type d"
                sh "echo 'Looking for all Dockerfiles:' && find . -name 'Dockerfile*' -type f 2>/dev/null"
                sh "echo 'Looking for package.json files:' && find . -name 'package.json' -type f 2>/dev/null | head -10"
                sh "echo 'Checking if frontend directory exists:' && test -d frontend && echo 'YES - frontend/ exists' || echo 'NO - frontend/ NOT found'"
                sh "echo 'Checking if backend directory exists:' && test -d backend && echo 'YES - backend/ exists' || echo 'NO - backend/ NOT found'"
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
