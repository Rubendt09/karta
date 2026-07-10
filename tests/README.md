# Guía de pruebas y métricas para los OE

Este directorio contiene scripts y configuraciones para medir las métricas asociadas a los Objetivos Específicos del proyecto Karta.

## Estructura

- `k6/upload-document.js`: prueba de carga para medir TR (Tiempo de Registro) en OE1.
- `k6/list-documents.js`: prueba de carga para medir TB (Tiempo de Búsqueda) en OE2.
- `artillery/sse-chat.yml` y `sse-processor.js`: prueba de latencia SSE para TRA en OE4 (requiere ajustes para SSE nativo).
- `node/sse-chat.js`: alternativa Node.js nativa para medir TTFB/TTC del chat SSE.
- `sql/metabase-tps.sql`: queries para construir el dashboard de TPS en OE3.
- `../infra/observability/`: configuración de Prometheus + Grafana.
- `../docker-compose.metrics.yml`: Compose con Metabase, Prometheus y Grafana.

## Requisitos previos

- Docker y Docker Compose instalados.
- El stack principal de Karta + métricas en ejecución.
- Datos de prueba cargados y un JWT válido.

## 1) Cargar datos de prueba y obtener token

```bash
# Cargar usuarios, proyecto, acceso y documento de prueba
docker exec -i karta-postgres psql -U karta_user -d karta_db < tests/sql/seed-test-data.sql

# Obtener token de admin (por defecto: admin@karta.test / KartaTest2024!)
export TOKEN=$(node tests/node/get-token.js)
echo $TOKEN

# IDs de prueba
export PROJECT_ID="33333333-3333-3333-3333-333333333333"
export DOCUMENT_ID="55555555-5555-5555-5555-555555555555"
export BASE_URL="http://localhost:8080/api/v1"
```

## Levantar herramientas de métricas

```bash
docker compose -f docker-compose.yml -f docker-compose.metrics.yml up -d
```

Accesos:
- Metabase: http://localhost:3000
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3100 (admin / karta-admin)

## Habilitar pg_stat_statements

```bash
docker exec -it karta-postgres psql -U karta_user -d karta_db -c "CREATE EXTENSION IF NOT EXISTS pg_stat_statements;"
```

## Ejecutar pruebas k6

Obtén un token JWT (login) y exporta variables:

```bash
export TOKEN="tu-jwt"
export PROJECT_ID="uuid-del-proyecto"
export BASE_URL="http://localhost:8080/api/v1"
```

### Subida de documentos (OE1 - TR)

```bash
# Para k6 dentro de Docker, usa la red de Karta y el hostname del servicio app
export BASE_URL="http://karta-app:8080/api/v1"

docker run --rm -i \
  --network karta_karta-network \
  -v $(pwd)/tests/k6:/tests \
  -e TOKEN -e PROJECT_ID -e BASE_URL \
  grafana/k6 run /tests/upload-document.js
```

### Listado y descarga (OE2 - TB)

```bash
export BASE_URL="http://karta-app:8080/api/v1"

docker run --rm -i \
  --network karta_karta-network \
  -v $(pwd)/tests/k6:/tests \
  -e TOKEN -e PROJECT_ID -e BASE_URL \
  grafana/k6 run /tests/list-documents.js
```

## Ejecutar prueba SSE con Node.js (OE4 - TRA, recomendado)

```bash
cd tests/node
export TOKEN="tu-jwt"
export PROJECT_ID="33333333-3333-3333-3333-333333333333"
export DOCUMENT_ID="55555555-5555-5555-5555-555555555555"
export BASE_URL="http://localhost:8080/api/v1"
node sse-chat.js
```

El archivo `sse-latency.csv` se generará con las columnas:
`startTime,firstByteTime,completeTime,ttfb,ttc`.

## Ejecutar prueba SSE con Artillery (OE4 - TRA)

```bash
export DOCUMENT_ID="uuid-del-documento"
npx artillery@latest run tests/artillery/sse-chat.yml
```

## Dashboard TPS en Metabase (OE3)

1. Abre Metabase en http://localhost:3000 y configura la base de datos PostgreSQL:
   - Host: `postgres`
   - Puerto: `5432`
   - Base de datos: `karta_db`
   - Usuario: `karta_user`
   - Contraseña: `karta_password`
2. Ejecuta las queries de `sql/metabase-tps.sql` como preguntas nativas.
3. Crea un dashboard con las tarjetas: incidentes/mes, documentos/mes, TPS.

## Grafana

Una vez que el backend se reconstruya con Actuator/Micrometer, Prometheus recolectará automáticamente las métricas de `/actuator/prometheus` y Grafana mostrará el dashboard preconfigurado.

## Notas

- Los tests que consumen Gemini (`sse-chat.yml`) generan costo de API; limita la concurrencia.
- Asegúrate de que el usuario del token tenga permisos `canView`/`canEdit` sobre el proyecto.
- Para mediciones frontend (Web Performance API), instrumenta manualmente los handlers de subida, listado y chat.
