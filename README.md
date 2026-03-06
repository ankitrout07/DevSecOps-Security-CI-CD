# DevSecOps Security Autoscaling & K8S Blue-Green

![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/kubernetes-%23326ce5.svg?style=for-the-badge&logo=kubernetes&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/github%20actions-%232088FF.svg?style=for-the-badge&logo=githubactions&logoColor=white)

An automated, high-availability 3-tier architecture featuring a **Node.js Backend**, **MySQL Primary-Replica Cluster**, and a **React/Next.js Frontend**. This repository demonstrates production-level scaling logic and CI/CD security integration.

## 🏗️ Architecture Overview

*   **Frontend Tier:** Containerized UI optimized for high-concurrency.
*   **Application Tier:** Node.js API with horizontal autoscaling (HPA).
*   **Database Tier:** MySQL Primary (RW) with dynamic Scaling Read-Replicas.
*   **Caching:** Redis Cluster for session management and speed.

## 🛠️ Tech Stack

*   **Orchestration:** Docker Compose / Kubernetes (EKS/GKE)
*   **Monitoring:** `ctop`, `Prometheus`, `Grafana`
*   **Database:** MySQL 8.0 with GTID-based replication
*   **Security:** Snyk, SonarQube, and OWASP ZAP scanning

---

## 🚦 Getting Started

### 1. Clone the Repository
```bash
git clone [https://github.com/ankitrout07/DevSecOps-Security-CI-CD.git](https://github.com/ankitrout07/DevSecOps-Security-CI-CD.git)
cd DevSecOps-Security-CI-CD
