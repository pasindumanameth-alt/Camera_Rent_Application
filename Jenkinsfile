pipeline {
  agent any

  environment {
    FRONTEND_IMAGE = "pasindumanmeth/camerarent-frontend"
    BACKEND_IMAGE  = "pasindumanmeth/camerarent-backend"
  }

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  stages {
    stage('SCM Checkout') {
      steps {
        retry(3) {
          git branch: 'main', url: 'https://github.com/pasindumanameth-alt/Camera_Rent_Application.git'
        }
      }
    }

    stage('Build Frontend Image (no-cache)') {
      steps {
        sh """
          docker build --no-cache -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} -f frontend/Dockerfile frontend
          docker tag ${FRONTEND_IMAGE}:${BUILD_NUMBER} ${FRONTEND_IMAGE}:latest
        """
      }
    }

    stage('Build Backend Image') {
      steps {
        sh """
          docker build -t ${BACKEND_IMAGE}:${BUILD_NUMBER} -f backend/Dockerfile backend
          docker tag ${BACKEND_IMAGE}:${BUILD_NUMBER} ${BACKEND_IMAGE}:latest
        """
      }
    }

    stage('Login to Docker Hub') {
      steps {
        withCredentials([string(credentialsId: 'dockerhubpassword', variable: 'DOCKERHUB_PASSWORD')]) {
          sh "docker login -u pasindumanmeth -p '${DOCKERHUB_PASSWORD}'"
        }
      }
    }

    stage('Push Images') {
      steps {
        sh """
          docker push ${FRONTEND_IMAGE}:${BUILD_NUMBER}
          docker push ${FRONTEND_IMAGE}:latest
          docker push ${BACKEND_IMAGE}:${BUILD_NUMBER}
          docker push ${BACKEND_IMAGE}:latest
        """
      }
    }

    stage('Deploy with Docker Compose') {
      steps {
        dir("${WORKSPACE}") {
          sh '''
            docker-compose down || true
            docker-compose pull
            docker-compose up -d --force-recreate --remove-orphans
          '''
        }
      }
    }

    stage('Verify Deployed Frontend Image') {
      steps {
        sh '''
          echo "Running containers:"
          docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}"
        '''
      }
    }
  }

  post {
    always {
      sh 'docker logout || true'
    }
  }
}
