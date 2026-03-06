# DevSecOps Blue-Green Deployment on Kubernetes

A production-ready CI/CD implementation featuring a Node.js application deployed using a **Blue-Green strategy**. This project focuses on zero-downtime updates, container hardening, and automated security scanning.

---

## 🚀 Project Overview
This project demonstrates a full DevSecOps lifecycle:
1. **Develop:** Node.js application with environment-aware UI.
2. **Harden:** Multi-stage Docker builds to reduce attack surface.
3. **Scan:** Automated vulnerability assessment using **Trivy**.
4. **Orchestrate:** Kubernetes (Minikube) cluster management using **Kustomize**.
5. **Deploy:** Blue-Green traffic shifting for zero-downtime releases.

---

## 🛠 Tech Stack
* **Runtime:** Node.js
* **Containerization:** Docker (Multi-stage builds)
* **Orchestration:** Kubernetes (Minikube)
* **Configuration:** Kustomize (Overlays for Blue/Green)
* **Security:** Trivy (Container Scanning)
* **CI/CD:** GitHub Actions

---

## 🛡 Security Implementation
The project follows "Shift Left" security principles:
* **Trivy Scanning:** The pipeline fails automatically if any `CRITICAL` vulnerabilities are detected in the container image.
* **Non-Root User:** The Dockerfile is configured to run the application as a non-privileged user to prevent container breakout exploits.
* **Minimal Base Image:** Uses lightweight images to minimize the number of installed packages and potential vulnerabilities.

---

## 🏗 Kubernetes Architecture
The project uses a **Base + Overlay** structure with Kustomize:
* `k8s/base/`: Contains the core Deployment and Service manifests.
* `k8s/overlays/blue/`: Configures the stable production environment.
* `k8s/overlays/green/`: Configures the new version for testing.
* `production-service.yaml`: Acts as the "Traffic Router" using label selectors.

---

## 🚦 Deployment & Traffic Shifting

### 1. Build and Scan
```bash
# Build the image
docker build -t devsecops-node-app:v1 .

# Scan for vulnerabilities
trivy image --severity CRITICAL devsecops-node-app:v1
