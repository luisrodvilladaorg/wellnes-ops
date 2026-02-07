

 <p align="center">
  <img src="docs/images/docker-kubernetes.png" width="450">
</p>


**Thank you for watching!**

---

[![Go Report Card](https://goreportcard.com/badge/github.com/derailed/k9s?)](https://goreportcard.com/report/github.com/derailed/k9s)
[![golangci badge](https://img.shields.io/badge/golangci-A%2B-brightgreen)](https://golangci.com/r/github.com/derailed/k9s)
[![codebeat badge](https://img.shields.io/codebeat/grade/github/derailed/k9s/master)](https://codebeat.co/projects/github-com-derailed-k9s-master)
[![Docker Repository on Quay](https://quay.io/repository/derailed/k9s/status "Docker Repository on Quay")](https://quay.io/repository/derailed/k9s)
[![release](https://img.shields.io/github/release-pre/derailed/k9s.svg)](https://github.com/derailed/k9s/releases)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/mum4k/termdash/blob/master/LICENSE)
[![Releases](https://img.shields.io/github/downloads/derailed/k9s/total.svg)](https://github.com/derailed/k9s/releases)

---

## Screenshots

1. Arquitecture

  ![architecture](docs/images/arquitecture.png)



2. Pods

 ![Pods running](docs/images/pods-running.png)



3. Pods Monitoring

  ![Pods running](docs/images/monitoring.png)
  

4. CI/CD

 ![Pipelines](docs/images/deploy-nginx.png)


5. CI Backend

 ![Pods running](docs/images/backend-ci.png)


6. CD Backend

  ![Pods running](docs/images/backend-cd.png)
  

7. Some Workflows 

 ![Metrics Prometheus](docs/images/cackend-cd-working.png)


8. Prometheus

  ![Metrics Prometheus](docs/images/metrics-2.png)

9. Grafana

  ![Metrics Grafana](docs/images/metrics-grafana.png)
  
10. Metrics

  ![Metrics Grafana](docs/images/metrics.png)
---

## Demo Videos/Recordings

* [K9s v0.30.0 Sneak peek](https://youtu.be/mVBc1XneRJ4)
* [Vulnerability Scans](https://youtu.be/ULkl0MsaidU)
* [K9s v0.29.0](https://youtu.be/oiU3wmoAkBo)
* [K9s v0.21.3](https://youtu.be/wG8KCwDAhnw)
* [K9s v0.19.X](https://youtu.be/kj-WverKZ24)
* [K9s v0.18.0](https://www.youtube.com/watch?v=zMnD5e53yRw)


---

## Documentation

For additional screenshots related to the project and its execution, please visit the following link: [Kubernetes and Docker Guide wellness ops](https://github.com/luisrodvilladaorg/wellnes-ops/tree/main/docs).


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