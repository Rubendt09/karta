import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

import { DashboardContent } from 'src/layouts/dashboard';
import { AddNewProjectCard } from '../add-new-project-card';
import { ProjectCard } from '../project-card';
import { ToolbarProject } from '../toolbarbar-project';

// Mock data
const mockProjects = [
  {
    id: 1,
    title: 'Expedientes Legales Q3',
    description: 'Auditoría completa de contratos de proveedores y renovaciones trimestrales para el departamento jurídico.',
    status: 'active',
    role: 'owner',
    documents: 124,
    updatedAt: 'Hace 2h',
  },
  {
    id: 2,
    title: 'Migración de Archivos 2022',
    description: 'Traslado de activos digitales del servidor antiguo a la nueva infraestructura en la nube corporativa.',
    status: 'deprioritized',
    role: 'guest',
    documents: 2500,
    updatedAt: 'Hace 5d',
  },
  {
    id: 3,
    title: 'Campaña Marketing Verano',
    description: 'Documentación finalizada de la campaña estacional de retail y activos visuales aprobados por la gerencia.',
    status: 'archived',
    role: 'owner',
    documents: 45,
    updatedAt: 'Jul 23',
  },
  {
    id: 4,
    title: 'Nuevos Ingresos HR',
    description: 'Expedientes de onboarding para el personal de reciente incorporación en la sede central de Madrid.',
    status: 'active',
    role: 'guest',
    documents: 86,
    updatedAt: 'Hace 15m',
  },
];

export function ProjectsView() {

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Mis Proyectos
      </Typography>

      {/* Toolbar */}
      <ToolbarProject />

      {/* Projects Grid */}
      <Grid container spacing={3}>
        {mockProjects.map((project) => (
          <ProjectCard {...project} />
        ))}

        {/* Add New Project Card */}
        <AddNewProjectCard />
      </Grid>
    </DashboardContent>
  );
}
