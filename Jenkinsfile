pipeline {
    agent any
    options { skipDefaultCheckout(true) }
    environment {
        DOCKERHUB_REPO = 'pasindumanmeth/camerarent-new'
        DOCKERHUB_USER = 'pasindumanmeth'
        DOCKERHUB_CRED_ID = 'dockerhubpassword' // existing credential id (string containing Docker Hub password)
        FRONTEND_DIR = 'frontend'
        BACKEND_DIR = 'backend'
    }
    stages {
        stage('Checkout') {
            steps {
                retry(3) { checkout scm }
            }
        }

        stage('Set Image Tag') {
            steps {
                script {
                    def gitShort = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                    env.IMAGE_TAG = "${env.BUILD_NUMBER}-${gitShort}"
                    echo "Image tag: ${env.IMAGE_TAG}"
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir("${env.WORKSPACE}/${FRONTEND_DIR}") {
                    sh "docker build -t ${DOCKERHUB_REPO}:frontend-${IMAGE_TAG} -f Dockerfile ."
                }
            }
        }

        stage('Build Backend') {
            steps {
                dir("${env.WORKSPACE}/${BACKEND_DIR}") {
                    sh "docker build -t ${DOCKERHUB_REPO}:backend-${IMAGE_TAG} -f Dockerfile ."
                }
            }
        }

        stage('Docker Hub Login') {
            steps {
                withCredentials([string(credentialsId: env.DOCKERHUB_CRED_ID, variable: 'DOCKERHUB_PASS')]) {
                    sh "echo $DOCKERHUB_PASS | docker login -u ${DOCKERHUB_USER} --password-stdin"
                }
            }
        }

        stage('Push Images') {
            steps {
                sh "docker push ${DOCKERHUB_REPO}:frontend-${IMAGE_TAG}"
                sh "docker push ${DOCKERHUB_REPO}:backend-${IMAGE_TAG}"
            }
        }

        stage('Deploy') {
            steps {
                // If your docker-compose uses image names, consider updating it to use the pushed tags.
                dir("${env.WORKSPACE}") {
                    sh 'docker-compose down || true'
                    sh 'docker-compose up -d --build'
                }
            }
        }
    }
    post {
        always {
            sh 'docker logout || true'
        }
    }
}