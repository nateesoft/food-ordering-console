pipeline {
    agent any

    environment {
        DEPLOY_DIR = 'C:\\apps\\food-ordering\\food-ordering-console'
        PM2_HOME   = 'C:\\ProgramData\\pm2'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                dir('food-ordering-console') {
                    bat 'npm ci'
                    bat 'npm run build'
                }
            }
        }

        stage('Prepare Standalone') {
            steps {
                dir('food-ordering-console') {
                    bat 'xcopy /E /I /Y public .next\\standalone\\public\\'
                    bat 'xcopy /E /I /Y .next\\static .next\\standalone\\.next\\static\\'
                }
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
                    powershell -Command "Copy-Item -Path food-ordering-console\\.next\\standalone\\* -Destination %DEPLOY_DIR% -Recurse -Force"
                '''
            }
        }

        stage('Deploy Config') {
            steps {
                bat "copy /Y food-ordering-console\\ecosystem.config.js %DEPLOY_DIR%\\ecosystem.config.js"
            }
        }

        stage('Start PM2') {
            steps {
                bat "cd %DEPLOY_DIR% && pm2 start ecosystem.config.js --env production"
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
