pipeline {
    agent any

    environment {
        // 🔧 Customize these
        DOCKERHUB_CREDENTIALS = 'dockerhub-credentials-id'   // Jenkins credentials ID
        DOCKERHUB_USER = 'pasindumanameth'
        BACKEND_IMAGE = 'camera-rent-backend'
        FRONTEND_IMAGE = 'camera-rent-frontend'
        REACT_APP_API_URL = 'http://localhost:5001'  // or your production API
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // ===================== BACKEND =====================
        stage('Build Backend') {
            dir('backend') {
                steps {
                    script {
                        echo "Building Backend Docker image..."
                        sh '''
                        docker build -t $DOCKERHUB_USER/$BACKEND_IMAGE:latest .
                        '''
                    }
                }
            }
        }

        // ===================== FRONTEND =====================
        stage('Build Frontend') {
            dir('frontend') {
                steps {
                    script {
                        echo "Building Frontend Docker image..."
                        sh '''
                        docker build --build-arg REACT_APP_API_URL=$REACT_APP_API_URL \
                                     -t $DOCKERHUB_USER/$FRONTEND_IMAGE:latest .
                        '''
                    }
                }
            }
        }

        // ===================== PUSH TO DOCKER HUB =====================
        stage('Push Images') {
            steps {
                script {
                    echo "Pushing images to Docker Hub..."
                    withCredentials([usernamePassword(credentialsId: "dockerhub-credentials-id", usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                        sh '''
                        echo "$PASSWORD" | docker login -u "$USERNAME" --password-stdin
                        docker push $DOCKERHUB_USER/$BACKEND_IMAGE:latest
                        docker push $DOCKERHUB_USER/$FRONTEND_IMAGE:latest
                        docker logout
                        '''
                    }
                }
            }
        }

        // ===================== DEPLOY (optional) =====================
        stage('Deploy') {
            steps {
                script {
                    echo "Deploying containers..."
                    sh '''
                    docker compose down || true
                    docker compose up -d --build
                    '''
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline finished. Cleaning up..."
            sh 'docker system prune -f || true'
        }
    }
}
