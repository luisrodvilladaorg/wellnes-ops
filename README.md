# Wellness Ops

DevOps-oriented full-stack application built with Docker, featuring a Node.js backend, PostgreSQL database, Nginx reverse proxy, CI/CD pipeline, and monitoring with Prometheus and Grafana.

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

CI/CD Pipeline

The project includes a GitHub Actions pipeline that runs on every push and pull request:

Install backend dependencies

Run automated tests

Build Docker backend image

This ensures that code changes are validated before deployment.

Monitoring & Observability

Prometheus scrapes backend metrics exposed at /metrics

Grafana displays dashboards including:

HTTP request count

Request latency

Endpoint-level metrics

The backend exposes custom metrics using middleware.

Security Considerations

JWT-based authentication

Secrets managed via environment variables

Backend isolated behind Nginx reverse proxy

No sensitive data committed to the repository

Security Considerations

JWT-based authentication

Secrets managed via environment variables

Backend isolated behind Nginx reverse proxy

No sensitive data committed to the repository


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
