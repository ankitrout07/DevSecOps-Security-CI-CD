# 🚀 DEVSECOPS BLUE-GREEN PROJECT: HOW TO RUN GUIDE

This guide provides flawless instructions to build, deploy, and monitor the project in a local or development Kubernetes environment. The application has been hardened with secure headers and features a real-time polling dashboard.

## 1. Prerequisites

Ensure you have the following installed and running:
- **Docker**
- **Kubernetes Cluster** (Minikube recommended)
- **kubectl** (CLI)
- **Node.js** (v20+ if running locally)

---

## 2. Local Setup & Testing

Before building the container, ensure your local environment is configured for development.

1. **Install Node.js Dependencies** (Installs Husky Pre-commit hooks)
   ```bash
   cd src/app
   npm install
   ```

2. **Run Application Tests** (Validates Jest API endpoints)
   ```bash
   npm test
   ```

---

## 3. Local Build & Security Scan

Before deploying, always build and scan your container for vulnerabilities.

1. **Build the hardened Docker image**
   ```bash
   docker build -t devsecops-node-app:v1 .
   ```

2. **Scan with Trivy (Fail on CRITICAL)**
   *(Install Trivy if not present: [Trivy Documentation](https://aquasecurity.github.io/trivy/))*
   ```bash
   trivy image --severity CRITICAL devsecops-node-app:v1
   ```

---

## 4. Kubernetes Deployment (Blue-Green)

Deploy the core infrastructure using Kustomize:

1. **Deploy the Base manifests** (Deployment, HPA, NetworkPolicy)
   ```bash
   kubectl apply -k k8s/base
   ```

2. **Deploy the Production Traffic Router**
   ```bash
   kubectl apply -f k8s/production-service.yaml
   ```

3. **Deploy the Blue Overlay** (Production Stable)
   ```bash
   kubectl apply -k k8s/overlays/blue
   ```

4. **Deploy the Green Overlay** (Testing Version)
   ```bash
   kubectl apply -k k8s/overlays/green
   ```

---

## 5. Monitoring & Real-Time Dashboard

The application dashboard now features a real-time API endpoint (`/api/status`) that dynamically streams Active Memory Usage and CPU Load to the UI every 3 seconds. 

Additionally, we enable deeper cluster observability using Prometheus and Grafana:

1. **Deploy monitoring manifests** (RBAC, ConfigMaps, Deployments)
   ```bash
   kubectl apply -f k8s/monitoring/
   ```

2. **Access Grafana**
   Wait for pods to be ready (`kubectl get pods`).
   
   *For Minikube users:*
   ```bash
   minikube service grafana-service
   ```
   
   *For others, access at:*
   http://localhost:32000  
   *(Default Login: `admin` / `admin`)*

3. **Connect Prometheus Data Source in Grafana:**
   URL: `http://prometheus-service:9090`

---

## 6. CI/CD Workflow Setup (GitHub Actions)

To enable the automated DevSecOps pipeline:
1. Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**.
2. Add the following Repository Secrets:
   - `KUBE_CONFIG`: Your `~/.kube/config` file content.
   - `SONAR_TOKEN`: Your SonarQube authentication token.
   - `SONAR_HOST_URL`: Your SonarQube instance URL.

---

## 7. Troubleshooting

- **Check pod status:**  
  ```bash
  kubectl get pods
  ```
- **Check pod logs:**  
  ```bash
  kubectl logs -l app=node-app
  ```
- **Verify Service:**  
  ```bash
  kubectl get svc final-production-service
  ```

---
**HAPPY DEPLOYING! 🛡️🚀**
