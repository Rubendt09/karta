-- Seed de datos de prueba para métricas de los OE
-- Instrucciones: docker exec -i karta-postgres psql -U karta_user -d karta_db < tests/sql/seed-test-data.sql

-- Usuarios de prueba
INSERT INTO users (id, email, password_hash, name, role, active, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'admin@karta.test', '$2b$10$f5IIc1vN7Nz3MjscZgZHX.bKuB1S8UVG2RVDHITjc34sNZJYdi1Iy', 'Admin Karta', 'ADMIN', true, NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'asesor@karta.test', '$2b$10$f5IIc1vN7Nz3MjscZgZHX.bKuB1S8UVG2RVDHITjc34sNZJYdi1Iy', 'Asesor Karta', 'ASESOR', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Proyecto de prueba
INSERT INTO projects (id, name, description, owner_id, status, created_at, updated_at)
VALUES
  ('33333333-3333-3333-3333-333333333333'::uuid, 'Proyecto de Pruebas OE', 'Proyecto para mediciones de desempeño y chat IA.', '11111111-1111-1111-1111-111111111111'::uuid, 'ACTIVO', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Acceso del asesor al proyecto
INSERT INTO project_access (id, project_id, user_id, can_view, can_edit, can_delete, can_deprioritize, can_invite, granted_by, granted_at)
VALUES
  ('44444444-4444-4444-4444-444444444444'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, true, true, false, false, false, '11111111-1111-1111-1111-111111111111'::uuid, NOW())
ON CONFLICT (id) DO NOTHING;

-- Documento de prueba (referencia a un archivo pequeño en uploads/)
INSERT INTO documents (id, project_id, name, description, file_path_storage, file_size, mime_type, uploaded_by, created_at, priority)
VALUES
  ('55555555-5555-5555-5555-555555555555'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, 'Documento de prueba OE', 'Texto de prueba para consultas del chat IA.', 'uploads/seed-test-doc.txt', 56, 'text/plain', '11111111-1111-1111-1111-111111111111'::uuid, NOW(), 'MEDIA')
ON CONFLICT (id) DO NOTHING;
