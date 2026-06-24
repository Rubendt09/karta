import { useEffect, useMemo, useState } from 'react';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import CircularProgress from '@mui/material/CircularProgress';
import CardHeader from '@mui/material/CardHeader';
import TableContainer from '@mui/material/TableContainer';

import { DashboardContent } from 'src/layouts/dashboard';
import { adminService } from 'src/services/adminService';
import { useAuth } from 'src/context/AuthContext';
import { Iconify } from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';

import { AnalyticsCurrentVisits } from '../analytics-current-visits';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';

import type { DashboardMetrics, ProjectSummary, UserActivity } from 'src/services/adminService';

// ----------------------------------------------------------------------

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

export function DashboardView() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [projectSummary, setProjectSummary] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const [metricsData, activityData, projectsData] = await Promise.all([
          adminService.getDashboardMetrics(),
          adminService.getUserActivity(),
          adminService.getProjectSummary(),
        ]);
        setMetrics(metricsData);
        setUserActivity(activityData);
        setProjectSummary(projectsData);
      } catch (err) {
        setError('Error al cargar el dashboard. Por favor, intenta nuevamente.');
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const topUsers = useMemo(
    () =>
      [...userActivity]
        .sort((a, b) => b.actionCount - a.actionCount)
        .slice(0, 10),
    [userActivity]
  );

  const topProjects = useMemo(
    () =>
      [...projectSummary]
        .sort((a, b) => b.documentCount - a.documentCount)
        .slice(0, 5),
    [projectSummary]
  );

  const activityChartData = useMemo(
    () => ({
      categories: topUsers.map((u) => u.email.split('@')[0]),
      series: [
        { name: 'Acciones', data: topUsers.map((u) => u.actionCount) },
      ],
    }),
    [topUsers]
  );

  const projectsChartData = useMemo(
    () => ({
      series: topProjects.map((p) => ({ label: p.name, value: p.documentCount })),
    }),
    [topProjects]
  );

  if (loading) {
    return (
      <DashboardContent maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="xl">
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 5 }}>
          <Typography variant="h4" sx={{ mb: { xs: 3, md: 1 } }}>
            Panel de Control
          </Typography>
          <Typography variant="inherit" sx={{ mb: { xs: 2, md: 5 } }}>
            Bienvenido de nuevo, {user?.name || 'Administrador'}. Aquí está el resumen de hoy.
          </Typography>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Usuarios registrados"
            total={metrics?.totalUsers ?? 0}
            icon={<Iconify width={48} icon="solar:users-group-rounded-bold-duotone" />}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Proyectos totales"
            total={metrics?.totalProjects ?? 0}
            color="secondary"
            icon={<Iconify width={48} icon="solar:folder-favourite-bookmark-bold" />}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Documentos indexados"
            total={metrics?.totalDocuments ?? 0}
            color="warning"
            icon={<Iconify width={48} icon="solar:file-bold-duotone" />}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Almacenamiento usado"
            total={metrics?.storageUsed ?? 0}
            color="error"
            icon={<Iconify width={48} icon="solar:database-bold" />}
            formatTotal={formatBytes}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          {topUsers.length > 0 ? (
            <AnalyticsWebsiteVisits
              title="Actividad de usuarios"
              subheader="Top 10 usuarios por número de acciones"
              chart={activityChartData}
            />
          ) : (
            <Card sx={{ height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">No hay actividad de usuarios para mostrar</Typography>
            </Card>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          {topProjects.length > 0 ? (
            <AnalyticsCurrentVisits
              title="Proyectos con más documentos"
              subheader="Top 5 proyectos"
              chart={projectsChartData}
            />
          ) : (
            <Card sx={{ height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">No hay proyectos para mostrar</Typography>
            </Card>
          )}
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title="Resumen de proyectos" subheader="Documentos y accesos por proyecto" />
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Proyecto</TableCell>
                    <TableCell align="right">Documentos</TableCell>
                    <TableCell align="right">Accesos</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projectSummary.map((project) => (
                    <TableRow key={project.projectId} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{project.name}</Typography>
                      </TableCell>
                      <TableCell align="right">{fNumber(project.documentCount)}</TableCell>
                      <TableCell align="right">{fNumber(project.accessCount)}</TableCell>
                    </TableRow>
                  ))}
                  {projectSummary.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No hay proyectos registrados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
