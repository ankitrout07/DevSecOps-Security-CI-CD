# 🚀 DevSecOps Blue-Green Deployment

A production-ready, security-first CI/CD implementation featuring a modular Node.js application deployed using a **Blue-Green strategy**. This project demonstrates a comprehensive DevSecOps lifecycle, from static analysis to real-time observability.

---

## 🛠 Tech Stack
* **Runtime:** Node.js (Modular Architecture)
* **Frontend:** Premium UI (Vanilla CSS + HTML5)
* **Containerization:** Docker (Multi-stage hardening)
* **Orchestration:** Kubernetes (Kustomize Overlays)
* **Security (SAST):** SonarQube
* **Security (SCA):** Trivy (Container Scanning)
* **Observability:** Prometheus & Grafana
* **CI/CD:** GitHub Actions

---

## 🛡️ DevSecOps Lifecycle

### 1. Develop & Modularize
The application is split into a modular structure (`src/app/public`) to separate concerns and improve maintainability.

### 2. Static Analysis (SAST)
**SonarQube** is integrated into the CI pipeline to perform deep code analysis, identifying bugs, vulnerabilities, and code smells before the build phase.

### 3. Container Hardening
* **Multi-stage Builds:** Final images contain only production artifacts.
* **Non-Root Execution:** Containers run as a non-privileged `node` user.
* **K8s Security Contexts:** Enforced at the cluster level (No privilege escalation, dropped capabilities).

### 4. Vulnerability Scanning (SCA)
**Trivy** scans every image for `HIGH` and `CRITICAL` vulnerabilities. The pipeline fails automatically if any significant risks are detected.

---

## 🚦 Blue-Green Deployment Strategy
We use Kustomize to manage environment-specific configurations:
* `k8s/base/`: Core manifests (Deployment, Service, HPA, NetworkPolicy).
* `k8s/overlays/blue/`: Production-stable environment.
* `k8s/overlays/green/`: Release-candidate environment for testing.
* `k8s/production-service.yaml`: Acts as the traffic router (Load Balancer).

**Deployment Flow:**
1. Build and scan the new version.
2. Deploy to the **Green** environment.
3. Perform **Smoke Testing** on Green.
4. Flip traffic from Blue to Green by patching the production service selector.

---

## 📊 Monitoring & Observability
Real-time insights are provided through a dedicated monitoring stack in `k8s/monitoring/`:
* **Prometheus**: Scrapes metrics from port `8080` using Kubernetes service discovery.
* **Grafana**: Visualizes performance and deployment status.
  * **Access:** `http://localhost:32000`
  * **Default Credentials:** `admin` / `admin`

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed and running:
* **Docker**
* **Kubernetes Cluster** (Minikube recommended)
* **kubectl** and **kustomize**
* **Node.js** (v20+ if running locally)

### 2. Local Setup & Testing
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

### 3. Local Build & Security Scan
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

### 4. Kubernetes Deployment (Blue-Green)
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

### 5. Monitoring & Real-Time Dashboard
The application dashboard features a real-time API endpoint (`/api/status`) that dynamically streams Active Memory Usage and CPU Load to the UI.
We enable deeper cluster observability using Prometheus and Grafana:

1. **Deploy monitoring manifests**
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

### 6. CI/CD Workflow Setup (GitHub Actions)
To enable the automated DevSecOps pipeline:
1. Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**.
2. Add the following Repository Secrets:
   - `KUBE_CONFIG`: Your `~/.kube/config` file content.
   - `SONAR_TOKEN`: Your SonarQube authentication token.
   - `SONAR_HOST_URL`: Your SonarQube instance URL.

Push to the `main` branch to trigger the GitHub Actions pipeline.

### 7. Troubleshooting
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
