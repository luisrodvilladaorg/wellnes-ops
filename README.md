Wellness-Ops – Dockerized Web Platform (DevOps Project)
📌 Overview

Wellness-Ops is a Docker-based web platform designed to demonstrate real-world DevOps and containerization practices used in enterprise environments.
The project focuses on service isolation, network segmentation, reverse proxying, and health monitoring, following production-ready architecture patterns.

This repository is intended as a technical portfolio project to showcase skills in Docker, networking, and backend/frontend integration.

🏗️ Architecture

The platform is composed of multiple isolated services connected through dedicated Docker networks:

Frontend
Static web application served via Nginx (internal container).

Reverse Proxy (Nginx)
Acts as the single entry point to the system, routing traffic to frontend and backend services.

Backend API (Node.js)
REST API exposing health endpoints and prepared for database integration.

Network Segmentation

web_net → Frontend + Nginx Proxy

backend_net → Backend API (and future database)

Only the Nginx reverse proxy has access to both networks, enforcing a secure and enterprise-style communication model.

Wellness-Ops – Dockerized Web Platform (DevOps Project)
📌 Overview

Wellness-Ops is a Docker-based web platform designed to demonstrate real-world DevOps and containerization practices used in enterprise environments.
The project focuses on service isolation, network segmentation, reverse proxying, and health monitoring, following production-ready architecture patterns.

This repository is intended as a technical portfolio project to showcase skills in Docker, networking, and backend/frontend integration.

🏗️ Architecture

The platform is composed of multiple isolated services connected through dedicated Docker networks:

Frontend
Static web application served via Nginx (internal container).

Reverse Proxy (Nginx)
Acts as the single entry point to the system, routing traffic to frontend and backend services.

Backend API (Node.js)
REST API exposing health endpoints and prepared for database integration.

Network Segmentation

web_net → Frontend + Nginx Proxy

backend_net → Backend API (and future database)

Only the Nginx reverse proxy has access to both networks, enforcing a secure and enterprise-style communication model.

🧪 Health Checks

Each service implements Docker health checks to ensure service readiness:

Frontend → HTTP check on root path

Backend → /api/health endpoint

Reverse proxy → container availability

This allows Docker Compose to monitor service state in a production-like manner.

⚙️ Technologies Used

Docker & Docker Compose

Nginx (static serving & reverse proxy)

Node.js (Backend API)

Linux-based containers (Alpine)

Environment-based configuration (.env)

docker compose -f docker-compose.dev.yml up -d --build

📈 Project Goals

This project is intentionally built step by step to reflect how systems evolve in real companies, not just to “make it work”.

Upcoming steps include:

PostgreSQL integration with persistent volumes

Database health checks and initialization scripts

HTTPS with certificates

Monitoring with Prometheus & Grafana

CI/CD pipelines

🎯 Why This Project

This repository demonstrates:

Understanding of container isolation and security

Realistic network design

Proper use of reverse proxies

Production-minded service orchestration

It is designed to reflect junior-to-mid DevOps / infrastructure engineering skills in a clear and auditable way.

A día 27/12
Tenemos los 4 contenedores funcionando, hemos cargado la web en el puerto 8080 luego en el 80  luego probamos el backend en localhost/api/health
y además de eso tenemos BD postgres en red privada misma red que backend, volumenes persistentes en la BD


