pipeline {
    agent any

    environment {
        DEPLOY_ROOT = 'D:\\ICS-Projects\\apps\\food-ordering'
        DEPLOY_DIR  = 'D:\\ICS-Projects\\apps\\food-ordering\\food-ordering-console'
        PM2_HOME    = 'C:\\Users\\Administrator\\.pm2'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                bat 'npm ci'
                bat 'npm run build'
            }
        }

        stage('Prepare Standalone') {
            steps {
                bat 'if exist public (xcopy /E /I /Y public .next\\standalone\\public\\) else (echo No public folder, skipping)'
                bat 'if exist .next\\static (xcopy /E /I /Y .next\\static .next\\standalone\\.next\\static\\) else (echo No .next\\static folder, skipping)'
            }
        }

        stage('Stop PM2') {
            steps {
                bat 'pm2 stop food-ordering-console 2>nul & exit 0'
                bat 'pm2 delete food-ordering-console 2>nul & exit 0'
            }
        }

        stage('Deploy') {
            steps {
                bat "if not exist %DEPLOY_DIR% mkdir %DEPLOY_DIR%"
                bat '''
                    powershell -Command "Copy-Item -Path .next\\standalone\\* -Destination %DEPLOY_DIR% -Recurse -Force"
                '''
            }
        }

        stage('Deploy Config') {
            steps {
                bat "copy /Y ecosystem.config.js %DEPLOY_ROOT%\\ecosystem.config.js"
            }
        }

        stage('Start PM2') {
            steps {
                bat "cd /d %DEPLOY_ROOT% && pm2 start ecosystem.config.js --only food-ordering-console --env production"
                bat 'pm2 save'
            }
        }

        stage('Register Startup') {
            steps {
                bat 'pm2-startup install 2>nul & exit 0'
                bat 'pm2 save'
            }
        }
    }

    post {
        success {
            bat 'pm2 list'
            echo 'Deployment food-ordering-console successful!'
        }
        failure {
            echo 'Deployment food-ordering-console failed — check the logs above.'
        }
    }
}
