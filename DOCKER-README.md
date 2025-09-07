# Despliegue con Docker Compose - Nutroos

Este documento explica cómo desplegar la aplicación Nutroos utilizando Docker Compose.

## Requisitos previos

- Docker
- Docker Compose

## Configuración

1. Copia el archivo `.env.example` a `.env` y configura las variables según tus necesidades:

```bash
cp .env.example .env
```

2. Edita el archivo `.env` para configurar las credenciales de MongoDB, secretos JWT, y otros parámetros.

## Despliegue

Para iniciar todos los servicios:

```bash
docker-compose up -d
```

Este comando construirá e iniciará los siguientes servicios:
- **mongodb**: Base de datos MongoDB
- **backend**: API de Node.js/Express
- **frontend**: Aplicación React servida por Nginx

## Acceso a la aplicación

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000
- **MongoDB**: mongodb://localhost:27017 (accesible solo desde los contenedores, a menos que accedas explícitamente)

## Comandos útiles

- Ver logs de todos los servicios:
  ```bash
  docker-compose logs -f
  ```

- Ver logs de un servicio específico:
  ```bash
  docker-compose logs -f [service_name]
  ```
  Ejemplo: `docker-compose logs -f backend`

- Detener todos los servicios:
  ```bash
  docker-compose down
  ```

- Detener y eliminar volúmenes (¡esto eliminará la base de datos!):
  ```bash
  docker-compose down -v
  ```

- Reconstruir e iniciar servicios:
  ```bash
  docker-compose up -d --build
  ```

## Solución de problemas

### Problema de conexión a MongoDB
Si el backend no puede conectarse a MongoDB, asegúrate de que:
1. El contenedor de MongoDB esté en ejecución: `docker-compose ps`
2. Las credenciales en el archivo `.env` sean correctas
3. La URL de conexión en la configuración del backend sea correcta

### Problema con el frontend
Si el frontend no puede comunicarse con el backend:
1. Verifica que el backend esté funcionando: `docker-compose logs backend`
2. Comprueba la configuración de la variable de entorno `VITE_API_URL`
3. Verifica la configuración del proxy en nginx.conf

## Desarrollo local con Docker

Para desarrollo, puedes montar volúmenes que reflejen cambios en tiempo real:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

(Nota: Debes crear un archivo docker-compose.dev.yml con configuración específica para desarrollo)
