# Wellness-Ops Frontend

This directory contains the web application for the Wellness-Ops project. It includes the files required for the user interface and static site experience.

## Structure

- **mi-web/**: HTML, CSS, image, and JavaScript files for the website.
- **Dockerfile.dev / Dockerfile.prod**: Docker build files for development and production frontend images.

## Features

- Video and image content views.
- Contact, about, and media detail pages.
- Integration with backend endpoints to display app data and metrics.

## Screenshot

![Browser view](../docs/images/navegador.png)

## How to Run

You can run the frontend with Docker:

```bash
docker build -f Dockerfile.dev -t wellness-frontend .
docker run -p 8080:80 wellness-frontend
```

You can also run it through the corresponding `docker-compose` configuration.

---

For more details, check the main project documentation.
