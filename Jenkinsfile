pipeline {
  agent any

  environment {
    DOCKERHUB_USER = "pasindumanmeth"
    FRONTEND_IMAGE = "pasindumanmeth/camerarent-frontend"
    BACKEND_IMAGE  = "pasindumanmeth/camerarent-backend"
  }

  stages {
    stage('Checkout') {
      steps {
        retry(3) {
          git branch: 'main', url: 'https://github.com/pasindumanameth-alt/Camera_Rent_Application.git'
        }
      }
    }

    stage('Build Frontend Image') {
      steps {
        sh "docker build -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} -f frontend/Dockerfile frontend"
      }
    }

    stage('Build Backend Image') {
      steps {
        sh "docker build -t ${BACKEND_IMAGE}:${BUILD_NUMBER} -f backend/Dockerfile backend"
      }
    }

    stage('Login to Docker Hub') {
      steps {
        withCredentials([string(credentialsId: 'dockerhubpassword', variable: 'DOCKERHUB_PASS')]) {
          sh 'echo "$DOCKERHUB_PASS" | docker login -u "$DOCKERHUB_USER" --password-stdin'
        }
      }
    }

    stage('Push Images') {
      steps {
        sh "docker push ${FRONTEND_IMAGE}:${BUILD_NUMBER}"
        sh "docker push ${BACKEND_IMAGE}:${BUILD_NUMBER}"
      }
    }

    stage('Deploy') {
      steps {
        dir("${WORKSPACE}") {
          sh 'docker-compose down --remove-orphans || true'
          sh 'docker-compose up -d'
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
