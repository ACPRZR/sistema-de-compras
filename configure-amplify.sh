#!/bin/bash

# Script para configurar variables de entorno en Amplify via AWS CLI
# Reemplaza estos valores con los de tu RDS

APP_ID="tu-app-id-aqui"
BRANCH_NAME="main"

# Configurar variables de entorno
aws amplify put-backend-environment \
  --app-id $APP_ID \
  --environment-name $BRANCH_NAME \
  --environment-variables \
    DB_HOST=tu-endpoint-rds.region.rds.amazonaws.com,DB_PORT=5432,DB_NAME=postgres,DB_USER=postgres,DB_PASSWORD=tu_password_seguro,DB_SSL=true,NODE_ENV=production

echo "Variables de entorno configuradas en Amplify"
