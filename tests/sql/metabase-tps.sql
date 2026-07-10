-- Queries recomendadas para Metabase (o cualquier BI) para calcular TPS (Tasa de Pérdidas/Siniestros)
-- Requiere una tabla o registro de incidentes; a continuación se muestra el esquema sugerido y las preguntas.

-- 1. Tabla auxiliar de incidentes (ejecutar una sola vez si no existe)
CREATE TABLE IF NOT EXISTS document_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID,
    project_id UUID,
    incident_type VARCHAR(100),
    description TEXT,
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Total de documentos por mes
SELECT
    DATE_TRUNC('month', d.created_at) AS month,
    COUNT(*) AS total_documents
FROM documents d
GROUP BY 1
ORDER BY 1;

-- 3. Incidentes por mes
SELECT
    DATE_TRUNC('month', i.reported_at) AS month,
    COUNT(*) AS incidents
FROM document_incidents i
GROUP BY 1
ORDER BY 1;

-- 4. TPS mensual = 100 * incidentes / documentos
WITH docs AS (
    SELECT DATE_TRUNC('month', created_at) AS month, COUNT(*) AS total
    FROM documents
    GROUP BY 1
),
inc AS (
    SELECT DATE_TRUNC('month', reported_at) AS month, COUNT(*) AS incidents
    FROM document_incidents
    GROUP BY 1
)
SELECT
    COALESCE(d.month, i.month) AS month,
    COALESCE(i.incidents, 0) AS incidents,
    COALESCE(d.total, 0) AS total_documents,
    CASE
        WHEN COALESCE(d.total, 0) = 0 THEN 0
        ELSE ROUND(100.0 * COALESCE(i.incidents, 0) / d.total, 2)
    END AS tps
FROM docs d
FULL OUTER JOIN inc i ON d.month = i.month
ORDER BY 1;
