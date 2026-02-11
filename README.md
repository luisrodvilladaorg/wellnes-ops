# 🧭 What is this?

This project is a fully containerized, production‑ready DevOps environment designed to demonstrate modern infrastructure practices. It brings together Docker, Kubernetes, GitHub Actions, NGINX, TLS, monitoring, and a complete CI/CD pipeline to showcase how a real-world application is built, deployed, and operated end‑to‑end.

## ⚙️ What does it do?

This system builds and deploys a Node.js  backend, serves a static frontend through an NGINX gateway, manages traffic using an Ingress Controller, and exposes the application securely through TLS. It also includes automated CI/CD pipelines, container image publishing, Kubernetes manifests, and a full monitoring stack with Prometheus and Grafana.

 <p align="center">
  <img src="docs/images/docker-kubernetes.png" width="450">
</p>

---



## Arquitecture

  ![architecture](docs/images/architecture.png)




## Pods

 ![Pods running](docs/images/pods-running.png)




## Pods running

  ![Pods running](docs/images/monitoring.png)
  


## CI/CD Continuous Integration


 ![Pipelines](docs/images/deploy-nginx.png)



## Continuous Integration Backend



 ![Pods running](docs/images/backend-ci.png)



## Continuous Deployment/Delivery 



  ![Pods running](docs/images/backend-cd.png)
  


## Pipelines



 ![Metrics Prometheus](docs/images/backend-cd-working.png)



## Prometheus



  ![Metrics Prometheus](docs/images/metrics-2.png)



## Grafana



  ![Metrics Grafana](docs/images/metrics-grafana.png)
  


## Metrics

  ![Metrics Grafana](docs/images/metrics.png)

---

## Documentation

For additional screenshots related to the project and its execution, please visit the following link: [Kubernetes and Docker Guide wellness ops](docs/kubernetes-guide.pdf).


## Installation

To install the project on your host, use the following command which will make a copy of the entire repository from Git.

*Prerequisites

- Docker >= 24
- Docker Compose
- Kubernetes (k3d/kind/minikube)
- kubectl
- Helm

   
* MacOS or Linux

   ```shell
   git clone https://github.com/luisrodvilladaorg/wellnes-ops.git
   cd wellnes-ops
   ```

* Create environment variables necessary for project use (see example file .env.example). For security reasons, we do not include public environment variables. 

  Edit the `.env` file if needed

* Start the stack with Docker Compose (development environment) in the background

  ```shell
  docker compose -f docker-compose.dev.yml up -d
  docker ps
  ```

* Verify that the backend is working

  ```shell
  docker logs -f backend
  ```

* functional tests

  ```shell
  curl http://localhost:3000/api/health
  ```

## Kubernetes (PRODUCTION / REAL mode)

* Create cluster

  ```shell
  k3d cluster create cluster-wellness-local
  ```

* apply manifests

  ```shell
  kubectl apply -R -f k8s/
  ```

* Check status

  ```shell
  kubectl get pods
  kubectl get svc
  kubectl get ingress
  ```
* Access the application

  ```shell
  curl -k https://wellness.local/api/health

  ```
Please update your `/etc/hosts` file by adding the following entry:

127.0.0.1   wellness.local


The project can be run locally using Docker Compose for development or deployed to Kubernetes for a production-like environment.

To continue with the next, more advanced steps on installing the nginx ingress controller and TLS certificates, please go to the file located in /docs/guide




---

## Diferent layers

                          ┌───────────────────────┐
                          │        Client         │
                          │   Browser / Curl      │
                          └───────────┬───────────┘
                                      │
                               HTTPS (443)
                                      │
                    ┌─────────────────▼─────────────────┐
                    │        NGINX Ingress Controller     │
                    │      (TLS termination, routing)    │
                    └───────────┬───────────┬───────────┘
                                │           │
                           "/"  │           │  "/api/*"
                                │           │
          ┌─────────────────────▼───┐   ┌───▼─────────────────────┐
          │      nginx-gateway      │   │        Backend API        │
          │   (internal reverse     │   │   Node.js / Express      │
          │        proxy)           │   │   JWT · REST · Metrics   │
          └───────────┬─────────────┘   └───────────┬─────────────┘
                      │                               │
                 HTTP │                               │ SQL
                      │                               │
        ┌─────────────▼─────────────┐     ┌──────────▼──────────┐
        │          Frontend          │     │     PostgreSQL       │
        │     Static Web (Nginx)     │     │   StatefulSet + PVC  │
        └───────────────────────────┘     └─────────────────────┘

        ───────────────────────── Observability ─────────────────────────

                 ┌───────────────────┐     ┌───────────────────┐
                 │    Prometheus     │◄────│  Backend /metrics │
                 │  (ServiceMonitor) │     │   (internal only) │
                 └─────────┬─────────┘
                           │
                           ▼
                     ┌───────────────┐
                     │    Grafana    │
                     │ Dashboards    │
                     └───────────────┘

        ───────────────────────── CI / CD ─────────────────────────

        ┌──────────────┐   build & push   ┌────────────────────────┐
        │   GitHub     │ ───────────────► │   GHCR (Docker Images) │
        │   Actions    │                  └───────────┬────────────┘
        └──────┬───────┘                              │
               │ deploy                                │ pull
               ▼                                       ▼
        ┌─────────────────────────────────────────────────────────┐
        │                    Kubernetes Cluster                   │
        │              (Rolling Updates & Rollback)               │
        └─────────────────────────────────────────────────────────┘

---


### Contributor

Luis Fernando Rodríguez Villada

luisfernando198912@gmail.com

https://luisops.com