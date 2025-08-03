#!/bin/bash

set -e

# FHIR Pediatric Care Platform Deployment Script
# This script deploys the application to AWS using Terraform and Docker

echo "🏥 FHIR Pediatric Care Platform Deployment"
echo "=========================================="

# Check prerequisites
check_prerequisites() {
    echo "📋 Checking prerequisites..."
    
    if ! command -v aws &> /dev/null; then
        echo "❌ AWS CLI is required but not installed"
        exit 1
    fi
    
    if ! command -v terraform &> /dev/null; then
        echo "❌ Terraform is required but not installed"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is required but not installed"
        exit 1
    fi
    
    echo "✅ All prerequisites met"
}

# Set variables
set_variables() {
    PROJECT_NAME=${PROJECT_NAME:-"fhir-pediatric-care"}
    AWS_REGION=${AWS_REGION:-"us-east-1"}
    ENVIRONMENT=${ENVIRONMENT:-"demo"}
    
    # Get AWS account ID
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
    REPOSITORY_NAME="${PROJECT_NAME}"
    
    echo "🔧 Configuration:"
    echo "   Project: ${PROJECT_NAME}"
    echo "   Region: ${AWS_REGION}"
    echo "   Environment: ${ENVIRONMENT}"
    echo "   Account ID: ${AWS_ACCOUNT_ID}"
}

# Create ECR repository if it doesn't exist
create_ecr_repository() {
    echo "📦 Setting up ECR repository..."
    
    if ! aws ecr describe-repositories --repository-names ${REPOSITORY_NAME} --region ${AWS_REGION} &> /dev/null; then
        echo "Creating ECR repository: ${REPOSITORY_NAME}"
        aws ecr create-repository \
            --repository-name ${REPOSITORY_NAME} \
            --region ${AWS_REGION} \
            --image-scanning-configuration scanOnPush=true
    else
        echo "ECR repository already exists: ${REPOSITORY_NAME}"
    fi
}

# Build and push Docker image
build_and_push() {
    echo "🐳 Building and pushing Docker image..."
    
    # Login to ECR
    aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_URI}
    
    # Build image
    echo "Building Docker image..."
    docker build -t ${REPOSITORY_NAME}:latest .
    
    # Tag image
    docker tag ${REPOSITORY_NAME}:latest ${ECR_URI}/${REPOSITORY_NAME}:latest
    docker tag ${REPOSITORY_NAME}:latest ${ECR_URI}/${REPOSITORY_NAME}:$(date +%Y%m%d%H%M%S)
    
    # Push image
    echo "Pushing Docker image to ECR..."
    docker push ${ECR_URI}/${REPOSITORY_NAME}:latest
    docker push ${ECR_URI}/${REPOSITORY_NAME}:$(date +%Y%m%d%H%M%S)
    
    echo "✅ Docker image pushed successfully"
}

# Deploy infrastructure with Terraform
deploy_infrastructure() {
    echo "🏗️ Deploying infrastructure with Terraform..."
    
    cd terraform
    
    # Initialize Terraform
    terraform init
    
    # Plan infrastructure
    terraform plan \
        -var="project_name=${PROJECT_NAME}" \
        -var="environment=${ENVIRONMENT}" \
        -var="aws_region=${AWS_REGION}" \
        -var="app_image=${ECR_URI}/${REPOSITORY_NAME}:latest"
    
    # Apply infrastructure
    terraform apply -auto-approve \
        -var="project_name=${PROJECT_NAME}" \
        -var="environment=${ENVIRONMENT}" \
        -var="aws_region=${AWS_REGION}" \
        -var="app_image=${ECR_URI}/${REPOSITORY_NAME}:latest"
    
    # Get outputs
    ALB_URL=$(terraform output -raw alb_url)
    API_BASE_URL=$(terraform output -raw api_base_url)
    
    cd ..
    
    echo "✅ Infrastructure deployed successfully"
    echo "🌐 Application URL: ${ALB_URL}"
    echo "📡 API Base URL: ${API_BASE_URL}"
}

# Wait for service to be healthy
wait_for_health() {
    echo "🏥 Waiting for service to be healthy..."
    
    # Get the API URL
    cd terraform
    API_BASE_URL=$(terraform output -raw api_base_url)
    cd ..
    
    HEALTH_URL="${API_BASE_URL}/health"
    
    for i in {1..30}; do
        if curl -f "${HEALTH_URL}" &> /dev/null; then
            echo "✅ Service is healthy!"
            echo "🎉 Deployment completed successfully!"
            echo ""
            echo "📋 Service Information:"
            echo "   Health Check: ${HEALTH_URL}"
            echo "   API Documentation: ${API_BASE_URL}"
            echo ""
            echo "🧪 Test the API:"
            echo "   curl ${HEALTH_URL}"
            echo "   curl ${API_BASE_URL}/patients"
            return 0
        fi
        
        echo "⏳ Waiting for service... (attempt ${i}/30)"
        sleep 30
    done
    
    echo "❌ Service health check failed after 15 minutes"
    echo "🔍 Check ECS service logs in CloudWatch"
    return 1
}

# Cleanup function
cleanup() {
    echo "🧹 Cleaning up local Docker images..."
    docker image prune -f || true
}

# Main execution
main() {
    check_prerequisites
    set_variables
    create_ecr_repository
    build_and_push
    deploy_infrastructure
    wait_for_health
    cleanup
}

# Handle script interruption
trap cleanup EXIT

# Run main function
main "$@"