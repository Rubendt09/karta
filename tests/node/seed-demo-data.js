const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080/api/v1';
const MOCK_DIR = process.env.MOCK_DIR || '/Users/rubendt/Downloads/docs-mocks';
const ADMIN = {
  email: 'admin@karta.com',
  password: process.env.ADMIN_PASSWORD || 'admin123',
};
const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD || 'TestPass2024!';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function http(method, endpoint, token, body, isMultipart = false) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {};
  if (token && !isMultipart) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['Content-Type'] = 'application/json';
  } else if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }

  const options = { method, headers };
  if (body) {
    options.body = body;
  }

  const res = await fetch(url, options);
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch (e) {
    json = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} on ${method} ${endpoint}: ${JSON.stringify(json)}`);
  }
  return json;
}

async function login(email, password) {
  const res = await http('POST', '/auth/login', null, JSON.stringify({ email, password }));
  return res.data.token;
}

async function createUser(token, user) {
  try {
    const res = await http('POST', '/users', token, JSON.stringify({
      email: user.email,
      password: user.password || DEFAULT_PASSWORD,
      name: user.name,
      role: user.role,
    }));
    console.log(`  Created user: ${user.email} (${user.role})`);
    return res.data;
  } catch (err) {
    if (err.message.includes('Email already exists')) {
      console.log(`  User already exists: ${user.email}`);
      const all = await http('GET', '/users', token);
      const existing = all.data.find((u) => u.email === user.email);
      return existing;
    }
    throw err;
  }
}

async function createProject(token, project) {
  const res = await http('POST', '/projects', token, JSON.stringify({
    name: project.name,
    description: project.description,
  }));
  console.log(`  Created project: ${project.name}`);
  return res.data;
}

async function grantAccess(token, projectId, userId, permissions) {
  const res = await http('POST', `/projects/${projectId}/access`, token, JSON.stringify({
    userId,
    canView: permissions.canView,
    canEdit: permissions.canEdit,
    canDelete: permissions.canDelete,
    canDeprioritize: permissions.canDeprioritize,
    canInvite: permissions.canInvite,
  }));
  console.log(`    Granted access to ${userId}: ${JSON.stringify(permissions)}`);
  return res.data;
}

async function uploadDocument(token, projectId, filePath, name, priority, description) {
  const buffer = fs.readFileSync(filePath);
  const filename = path.basename(filePath);
  const file = new File([buffer], filename, { type: 'application/pdf' });

  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', name);
  if (priority) formData.append('priority', priority);
  if (description) formData.append('description', description);

  const res = await http('POST', `/projects/${projectId}/documents`, token, formData, true);
  console.log(`    Uploaded document: ${name} (${filename})`);
  return res.data;
}

const projects = [
  {
    name: 'Contrato Prestación de Servicios',
    description: 'Gestión de contratos de prestación de servicios profesionales para clientes corporativos.',
    ownerIndex: 0,
    docs: [
      { file: 'CONTRATO-POR-PRESTACION-DE-SERVICIOS-PROFESIONALES.pdf', name: 'Contrato de Servicios Profesionales', priority: 'ALTA', description: 'Contrato principal de servicios profesionales' },
    ],
  },
  {
    name: 'Locación de Servicios LP',
    description: 'Proyecto de locación de servicios para el área legal y de proyectos.',
    ownerIndex: 1,
    docs: [
      { file: 'Modelo-de-locacion-de-servicios-LP.pdf', name: 'Modelo Locación de Servicios LP', priority: 'MEDIA', description: 'Modelo de locación de servicios' },
      { file: 'CONTRATO-POR-PRESTACION-DE-SERVICIOS-PROFESIONALES.pdf', name: 'Anexo Contrato de Servicios', priority: 'BAJA', description: 'Anexo para locación de servicios' },
    ],
  },
  {
    name: 'Auditoría Externa VLP 2022',
    description: 'Documentación de auditoría externa realizada durante el año 2022.',
    ownerIndex: 2,
    docs: [
      { file: 'VLP Aud Ext 2022 1.pdf', name: 'Auditoría Externa VLP 2022', priority: 'ALTA', description: 'Informe de auditoría externa' },
    ],
  },
  {
    name: 'Contratos Corporativos Integrados',
    description: 'Consolidación de contratos corporativos y documentos legales de alto valor.',
    ownerIndex: 3,
    docs: [
      { file: 'CONTRATO-POR-PRESTACION-DE-SERVICIOS-PROFESIONALES.pdf', name: 'Contrato Corporativo Principal', priority: 'ALTA', description: 'Contrato corporativo principal' },
      { file: 'Modelo-de-locacion-de-servicios-LP.pdf', name: 'Locación de Servicios Corporativa', priority: 'MEDIA', description: 'Locación de servicios corporativa' },
      { file: 'VLP Aud Ext 2022 1.pdf', name: 'Auditoría Corporativa 2022', priority: 'BAJA', description: 'Auditoría corporativa 2022' },
    ],
  },
];

const asesorUsers = [
  { email: 'asesor.lucia@karta.test', name: 'Lucía Mendoza', role: 'ASESOR' },
  { email: 'asesor.carlos@karta.test', name: 'Carlos Ríos', role: 'ASESOR' },
  { email: 'asesor.ana@karta.test', name: 'Ana Beltrán', role: 'ASESOR' },
  { email: 'asesor.miguel@karta.test', name: 'Miguel Torres', role: 'ASESOR' },
];

const invitadoUsers = [
  { email: 'invitado.daniel@karta.test', name: 'Daniel Pérez', role: 'INVITADO' },
  { email: 'invitado.sofia@karta.test', name: 'Sofía Herrera', role: 'INVITADO' },
  { email: 'invitado.laura@karta.test', name: 'Laura Gómez', role: 'INVITADO' },
  { email: 'invitado.javier@karta.test', name: 'Javier Castro', role: 'INVITADO' },
  { email: 'invitado.camila@karta.test', name: 'Camila Rojas', role: 'INVITADO' },
  { email: 'invitado.andres@karta.test', name: 'Andrés Vargas', role: 'INVITADO' },
  { email: 'invitado.mariana@karta.test', name: 'Mariana Díaz', role: 'INVITADO' },
  { email: 'invitado.pedro@karta.test', name: 'Pedro León', role: 'INVITADO' },
  { email: 'invitado.elena@karta.test', name: 'Elena Navarro', role: 'INVITADO' },
  { email: 'invitado.roberto@karta.test', name: 'Roberto Silva', role: 'INVITADO' },
  { email: 'invitado.isabel@karta.test', name: 'Isabel Morales', role: 'INVITADO' },
  { email: 'invitado.francisco@karta.test', name: 'Francisco Vega', role: 'INVITADO' },
];

const permissionPatterns = [
  { canView: true, canEdit: false, canDelete: false, canDeprioritize: false, canInvite: false },
  { canView: true, canEdit: true, canDelete: false, canDeprioritize: false, canInvite: false },
  { canView: true, canEdit: true, canDelete: true, canDeprioritize: true, canInvite: true },
];

async function main() {
  console.log('Iniciando carga de datos de prueba...\n');

  console.log('1. Login como admin...');
  const adminToken = await login(ADMIN.email, ADMIN.password);
  console.log('   Admin autenticado.\n');

  console.log('2. Creando usuarios de prueba...');
  const createdAsesores = [];
  for (const u of asesorUsers) {
    const created = await createUser(adminToken, u);
    createdAsesores.push(created);
  }
  const createdInvitados = [];
  for (const u of invitadoUsers) {
    const created = await createUser(adminToken, u);
    createdInvitados.push(created);
  }
  console.log(`   Total usuarios: ${createdAsesores.length} asesores + ${createdInvitados.length} invitados.\n`);

  console.log('3. Creando proyectos, accesos y documentos...');
  const summary = [];

  for (let i = 0; i < projects.length; i++) {
    const projectSpec = projects[i];
    const owner = createdAsesores[projectSpec.ownerIndex];
    console.log(`\n  Proyecto ${i + 1}: ${projectSpec.name}`);
    console.log(`    Owner: ${owner.email}`);

    const ownerToken = await login(owner.email, DEFAULT_PASSWORD);
    const project = await createProject(ownerToken, projectSpec);

    const projectInvitados = createdInvitados.slice(i * 3, i * 3 + 3);
    for (let j = 0; j < projectInvitados.length; j++) {
      const invitado = projectInvitados[j];
      const perms = permissionPatterns[j % permissionPatterns.length];
      await grantAccess(ownerToken, project.id, invitado.id, perms);
    }

    const uploadedDocs = [];
    for (const doc of projectSpec.docs) {
      const filePath = path.join(MOCK_DIR, doc.file);
      if (!fs.existsSync(filePath)) {
        console.log(`    WARNING: File not found: ${filePath}`);
        continue;
      }
      const uploaded = await uploadDocument(ownerToken, project.id, filePath, doc.name, doc.priority, doc.description);
      uploadedDocs.push(uploaded.name);
      await sleep(300);
    }

    summary.push({
      project: project.name,
      owner: owner.email,
      projectId: project.id,
      invitados: projectInvitados.map((u) => u.email),
      documentos: uploadedDocs,
    });
  }

  console.log('\n========================================');
  console.log('RESUMEN DE DATOS DE PRUEBA CREADOS');
  console.log('========================================');
  for (const s of summary) {
    console.log(`\nProyecto: ${s.project} (${s.projectId})`);
    console.log(`  Owner: ${s.owner}`);
    console.log(`  Invitados: ${s.invitados.join(', ')}`);
    console.log(`  Documentos: ${s.documentos.join(', ')}`);
  }
  console.log('\n========================================');
  console.log('Credenciales de prueba:');
  console.log(`  Admin: ${ADMIN.email} / ${ADMIN.password}`);
  console.log(`  Asesores: ${asesorUsers.map((u) => u.email).join(', ')}`);
  console.log(`  Password común: ${DEFAULT_PASSWORD}`);
  console.log('========================================');
}

main().catch((err) => {
  console.error('\nERROR:', err.message);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
