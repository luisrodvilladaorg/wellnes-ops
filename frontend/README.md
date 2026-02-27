# Frontend de Wellness-Ops

Este directorio contiene la aplicación web del proyecto Wellness-Ops. Aquí encontrarás los archivos necesarios para la interfaz de usuario, desarrollada para facilitar la interacción con el sistema de gestión de bienestar.

## Estructura
- **mi-web/**: Contiene los archivos HTML, CSS, imágenes y scripts de la web.
- **Dockerfile.dev / Dockerfile.prod**: Archivos para construir la imagen Docker del frontend en entornos de desarrollo y producción.

## Características
- Visualización de videos e imágenes.
- Páginas de contacto, información y detalles multimedia.
- Integración con el backend para mostrar métricas y datos.

## Captura de pantalla
![Vista del navegador](../docs/images/navegador.png)

## Cómo ejecutar
Puedes levantar el frontend usando Docker:

```bash
docker build -f Dockerfile.dev -t wellness-frontend .
docker run -p 8080:80 wellness-frontend
```

O mediante el archivo `docker-compose.yml` correspondiente.

---
Para más información, consulta la documentación general del proyecto o contacta con el equipo de desarrollo.
