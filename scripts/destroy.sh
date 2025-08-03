#!/bin/bash

set -e

# FHIR Pediatric Care Platform Cleanup Script
# This script destroys all AWS resources created by the deployment

echo "🧹 FHIR Pediatric Care Platform Cleanup"
echo "======================================="

# Set variables
PROJECT_NAME=${PROJECT_NAME:-"fhir-pediatric-care"}
AWS_REGION=${AWS_REGION:-"us-east-1"}
ENVIRONMENT=${ENVIRONMENT:-"demo"}

echo "⚠️  WARNING: This will destroy all resources for ${PROJECT_NAME}"
echo "🔧 Configuration:"
echo "   Project: ${PROJECT_NAME}"
echo "   Region: ${AWS_REGION}"
echo "   Environment: ${ENVIRONMENT}"
echo ""

# Confirm destruction
read -p "Are you sure you want to destroy all resources? (yes/no): " -r
if [[ ! $REPLY =~ ^yes$ ]]; then
    echo "❌ Destruction cancelled"
    exit 1
fi

# Destroy infrastructure
destroy_infrastructure() {
    echo "🏗️ Destroying infrastructure with Terraform..."
    
    cd terraform
    
    terraform destroy -auto-approve \
        -var="project_name=${PROJECT_NAME}" \
        -var="environment=${ENVIRONMENT}" \
        -var="aws_region=${AWS_REGION}"
    
    cd ..
    
    echo "✅ Infrastructure destroyed"
}

# Delete ECR repository
delete_ecr_repository() {
    echo "📦 Deleting ECR repository..."
    
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    REPOSITORY_NAME="${PROJECT_NAME}"
    
    if aws ecr describe-repositories --repository-names ${REPOSITORY_NAME} --region ${AWS_REGION} &> /dev/null; then
        echo "Deleting ECR repository: ${REPOSITORY_NAME}"
        aws ecr delete-repository \
            --repository-name ${REPOSITORY_NAME} \
            --region ${AWS_REGION} \
            --force
        echo "✅ ECR repository deleted"
    else
        echo "ℹ️  ECR repository does not exist: ${REPOSITORY_NAME}"
    fi
}

# Main execution
main() {
    destroy_infrastructure
    delete_ecr_repository
    
    echo ""
    echo "🎉 Cleanup completed successfully!"
    echo "💰 All AWS resources have been destroyed to prevent charges"
}

main "$@"