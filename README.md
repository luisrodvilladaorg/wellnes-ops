# Wellnes Ops – Modern DevOps Infrastructure with Docker & GitHub Actions

A production‑ready infrastructure for deploying a backend service and Nginx reverse proxy using Docker, Docker Compose, GitHub Actions, and GitHub Container Registry (GHCR).
This repository demonstrates clean DevOps practices, automated CI/CD pipelines, and a modular container‑based architecture suitable for real‑world deployments.
---

## 🧰 Tech Stack

- **Backend**: Node.js (Express)
- **Database**: PostgreSQL
- **Frontend**: Static HTML / JavaScript
- **Reverse Proxy**: Nginx
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus & Grafana
- **Authentication**: JWT
- **Metrics**: Custom HTTP metrics exposed for Prometheus

---

## 🏗 Architecture Overview

The application is composed of multiple services orchestrated with Docker Compose:

- **Nginx**  
  Acts as the single entry point and reverse proxy for frontend and backend services.

- **Backend (Node.js API)**  
  Provides authentication, CRUD operations, health checks and Prometheus metrics.

- **PostgreSQL**  
  Persistent relational database, initialized automatically using SQL scripts.

- **Frontend**  
  Static UI consuming the backend API through Nginx.

- **Prometheus**  
  Scrapes metrics from the backend.

- **Grafana**  
  Visualizes metrics such as request count and latency.

---

## 📁 Project Structure

```text
.
├── backend
│   ├── src
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── routes
│   │   ├── middleware
│   │   ├── metrics
│   │   └── db.js
│   ├── test
│   ├── Dockerfile.dev
│   └── Dockerfile.prod
├── frontend
├── nginx
├── db
│   └── init.sql
├── monitoring
│   ├── prometheus
│   └── grafana
├── docker-compose.dev.yml
├── docker-compose.prod.yml
└── README.md


## 🐳 Dockerized Services

Backend

Packaged as a Docker image.

Automatically built and pushed to GHCR on every push to main.

Deployed via SSH using GitHub Actions.

Nginx Reverse Proxy

Custom production Dockerfile.

Handles routing, static assets, and proxying to the backend.

Built and pushed to GHCR through its own CI workflow.

docker-compose.yml

Defines the full stack:

Backend container

Nginx container

Networking between services

Environment variables

Image tags pulled from GHCR

This makes the entire environment reproducible on any machine

⚙️ CI/CD Pipelines

1. Backend CI (Continuous Integration)
Located in .github/workflows/backend-ci.yml.

It performs:

Checkout of the repository

Login to GHCR

Build backend Docker image

Tag with commit SHA and latest

Push both tags to GHCR

This ensures every commit produces a traceable, immutable image.


2. Backend CD (Continuous Deployment)

Located in .github/workflows/backend-cd.yml.

Triggered on push to main.

It performs:

SSH connection to the server using GitHub Secrets

Navigate to the deployment directory

Pull the latest backend image from GHCR

Restart the backend container with zero downtime

This creates a fully automated deployment pipeline.

3. Nginx CI

Located in .github/workflows/nginx-ci.yml.

It:

Builds the production Nginx image

Pushes it to GHCR

Ensures the reverse proxy is always up to date

🔐 Security Practices

SSH private key stored in secrets.SSH_KEY

Host, user, and connection details stored in GitHub Secrets

No sensitive data committed to the repository

Images stored in GHCR with controlled access

📦 Deployment Workflow

Developer pushes to main

GitHub Actions builds backend and Nginx images

Images are pushed to GHCR

CD workflow connects to the server via SSH

Server pulls the new image

Docker Compose restarts the updated service

Deployment completes automatically

This ensures consistent, repeatable, and safe deployments

🎯 Why This Project Matters

This repository demonstrates:

Real‑world CI/CD automation

Production‑grade Docker architecture

Secure and maintainable deployment workflows

Clean separation of services

Infrastructure that scales and adapts easily

It’s a strong example of DevOps engineering, container orchestration, and automated delivery pipelines.

📬 Contact

If you’d like to discuss the architecture or improvements, feel free to reach out.

luisfernando198912@gmail.com
+34612223759

If you want, I can also create:

a diagram of the architecture

a shorter recruiter‑focused summary

a badge section (build passing, GHCR, Docker pulls)

a project logo

Just tell me what style you want.

Sample4


                         ┌──────────────────────────┐
                         │        Frontend          │
                         │        (Nginx)           │
                         └────────────┬─────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │        Nginx Proxy       │
                         │  Reverse Proxy / Routing │
                         └────────────┬─────────────┘
                                      │
             ┌────────────────────────┼────────────────────────┐
             │                        │                        │
             ▼                        ▼                        ▼
 ┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
 │   Backend API     │      │   Prometheus     │      │     Grafana      │
 │  Node.js + Auth   │      │ Scraping metrics │      │ Dashboards/Logs  │
 └─────────┬────────┘      └─────────┬────────┘      └─────────┬────────┘
           │                           │                         │
           ▼                           │                         │
 ┌──────────────────┐                  │                         │
 │   PostgreSQL DB   │◄────────────────┘                         │
 │  Init scripts     │                                           │
 └──────────────────┘                                            │
                                                                 │
                     ┌───────────────────────────────────────────┘
                     │
                     ▼
           ┌──────────────────────────┐
           │        Docker Host       │
           │  (Compose: dev/prod)     │
           └──────────────────────────┘
