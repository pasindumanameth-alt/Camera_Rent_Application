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
                sshagent(['ec2-ssh-key']) {
                    sh """
ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_IP} << 'EOF'
    docker pull ${FRONTEND_IMAGE}:${BUILD_TAG}
    docker pull ${BACKEND_IMAGE}:${BUILD_TAG}

    docker stop frontend backend mongo || true
    docker rm frontend backend mongo || true

    docker network create mern-net || true
    docker volume create mongo-data || true

    # Run MongoDB for the backend
    docker run -d \\
        --name mongo \\
        --network mern-net \\
        -p 27017:27017 \\
        -v mongo-data:/data/db \\
        mongo:6

    # Run backend with connection string to MongoDB container
    docker run -d \\
        --name backend \\
        --network mern-net \\
        -p 5000:5000 \\
        -e MONGODB_URI="mongodb://mongo:27017/camerarentdb" \\
        -e JWT_SECRET="supersecret-jwt-key" \\
        ${BACKEND_IMAGE}:${BUILD_TAG}

    # Run frontend
    docker run -d \\
        --name frontend \\
        --network mern-net \\
        -p 80:80 \\
        ${FRONTEND_IMAGE}:${BUILD_TAG}
EOF
                    """
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
