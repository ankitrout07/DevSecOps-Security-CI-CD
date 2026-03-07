# 🚀 Enterprise DevSecOps Blue-Green Deployment

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

## � Monitoring & Observability
Real-time insights are provided through a dedicated monitoring stack in `k8s/monitoring/`:
* **Prometheus**: Scrapes metrics from port `8080` using Kubernetes service discovery.
* **Grafana**: Visualizes performance and deployment status.
  * **Access:** `http://localhost:32000`
  * **Default Credentials:** `admin` / `admin`

---

## 🚀 Getting Started

### Prerequisites
* Kubernetes Cluster (Minikube/EKS/GKE)
* `kubectl` and `kustomize` installed
* Docker

### Installation
1. **Deploy Application Base:**
   ```bash
   kubectl apply -k k8s/base
   ```
2. **Deploy Monitoring Stack:**
   ```bash
   kubectl apply -f k8s/monitoring/
   ```
3. **Trigger CI/CD:**
   Push to the `main` branch to trigger the GitHub Actions pipeline. Ensure `SONAR_TOKEN`, `SONAR_HOST_URL`, and `KUBE_CONFIG` are set in GitHub Secrets.

---

