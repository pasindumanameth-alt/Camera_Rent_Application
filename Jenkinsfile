pipeline {
    agent any

    environment {
        FRONTEND_IMAGE = "pasindumanmeth/camerarent-frontend"
        BACKEND_IMAGE  = "pasindumanmeth/camerarent-backend"
        BUILD_TAG      = "${BUILD_NUMBER}"
        EC2_USER       = "ubuntu"
        // Replace with Terraform output `app_server_public_ip`
        EC2_IP         = "13.53.37.159"
    }

    stages {

        stage('SCM Checkout') {
            steps {
                retry(3) {
                    git branch: 'main',
                        url: 'https://github.com/pasindumanameth-alt/Camera_Rent_Application.git'
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                dir('frontend') {
                    sh "docker build -t ${FRONTEND_IMAGE}:${BUILD_TAG} ."
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    sh "docker build -t ${BACKEND_IMAGE}:${BUILD_TAG} ."
                }
            }
        }

        stage('Docker Hub Login') {
            steps {
                withCredentials([string(credentialsId: 'dockerhubpassword', variable: 'DOCKER_PASSWORD')]) {
                    sh "docker login -u pasindumanmeth -p '${DOCKER_PASSWORD}'"
                }
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                sh "docker push ${FRONTEND_IMAGE}:${BUILD_TAG}"
                sh "docker push ${BACKEND_IMAGE}:${BUILD_TAG}"
            }
        }

        stage('Deploy on EC2 Server') {
            steps {
                script {
                    withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                        sh """
                            chmod 600 \${SSH_KEY}
                            ssh -o StrictHostKeyChecking=no -i \${SSH_KEY} ${EC2_USER}@${EC2_IP} << 'ENDSSH'
                                # Pull new images
                                docker pull ${FRONTEND_IMAGE}:${BUILD_TAG}
                                docker pull ${BACKEND_IMAGE}:${BUILD_TAG}

                                # Stop and remove all existing containers
                                echo "Stopping all running containers..."
                                docker stop \$(docker ps -aq) 2>/dev/null || true
                                docker rm \$(docker ps -aq) 2>/dev/null || true

                                # Create network and volume if they don't exist
                                docker network create mern-net 2>/dev/null || true
                                docker volume create mongo-data 2>/dev/null || true

                                # Run MongoDB for the backend
                                docker run -d \\
                                    --name mongo \\
                                    --network mern-net \\
                                    -p 27017:27017 \\
                                    -v mongo-data:/data/db \\
                                    --restart unless-stopped \\
                                    mongo:6

                                # Wait for MongoDB to be ready
                                sleep 5

                                # Run backend with connection string to MongoDB container
                                docker run -d \\
                                    --name backend \\
                                    --network mern-net \\
                                    -p 5000:5000 \\
                                    -e MONGODB_URI="mongodb://mongo:27017/camerarentdb" \\
                                    -e JWT_SECRET="supersecret-jwt-key" \\
                                    --restart unless-stopped \\
                                    ${BACKEND_IMAGE}:${BUILD_TAG}

                                # Run frontend
                                docker run -d \\
                                    --name frontend \\
                                    --network mern-net \\
                                    -p 80:80 \\
                                    --restart unless-stopped \\
                                    ${FRONTEND_IMAGE}:${BUILD_TAG}

                                # Show running containers
                                echo "Deployment successful! Running containers:"
                                docker ps --format "table {{.Names}}\\t{{.Image}}\\t{{.Status}}\\t{{.Ports}}"
ENDSSH
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            sh 'docker logout'
        }
    }
}
