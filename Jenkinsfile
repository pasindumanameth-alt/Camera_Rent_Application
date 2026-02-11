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
    sh "docker build -t pasindumanmeth/camerarent-new-frontend:${BUILD_NUMBER} -f frontend/Dockerfile frontend"
  }
}

stage('Build Backend Image') {
  steps {
    sh "docker build -t pasindumanmeth/camerarent-new-backend:${BUILD_NUMBER} -f backend/Dockerfile backend"
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