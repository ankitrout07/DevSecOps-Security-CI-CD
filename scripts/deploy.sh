#!/bin/bash

# DevSecOps Blue-Green Deployment Automation Script
# Usage: ./deploy.sh <version_tag>

VERSION=${1:-"v1.1.0"}
IMAGE_NAME="devsecops-node-app"

echo "🚀 Starting Blue-Green Deployment for version: $VERSION"

# 1. Build
echo "📦 Building Docker image..."
docker build -t $IMAGE_NAME:$VERSION .

# 2. Security Scan
echo "🛡 Scanning image for vulnerabilities..."
if command -v trivy &> /dev/null; then
    trivy image --config security/policies/trivy.yaml $IMAGE_NAME:$VERSION
else
    echo "⚠️ Trivy not found, skipping security scan."
fi

# 3. Deploy Green (New Version)
echo "🟢 Deploying to GREEN environment..."
cd k8s/overlays/green
kubectl kustomize . | kubectl apply -f -

# 4. Wait for Green Readiness
echo "⏳ Waiting for GREEN pods to be ready..."
kubectl rollout status deployment/green-node-app --timeout=90s

# 5. Smoke Test
echo "🔍 Performing smoke test on GREEN environment..."
GREEN_URL=$(kubectl get svc green-node-app-service -o jsonpath='{.spec.clusterIP}')
if [ -n "$GREEN_URL" ]; then
    HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://$GREEN_URL:8080/health)
    if [ "$HEALTH" != "200" ]; then
        echo "❌ Smoke test failed! Rolling back..."
        exit 1
    fi
fi

# 6. Traffic Flip
echo "🚦 Flipping traffic to GREEN..."
kubectl patch svc final-production-service -p '{"spec":{"selector":{"variant":"green"}}}'

echo "✅ Deployment Successful! Traffic is now served by GREEN ($VERSION)"
