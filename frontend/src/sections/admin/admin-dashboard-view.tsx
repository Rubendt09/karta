import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { adminService } from 'src/services/adminService';

export function AdminDashboardView() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      setError('Error al cargar métricas. Por favor, intenta nuevamente.');
      console.error('Error loading metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Dashboard Administrativo
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Metrics Grid */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Total Usuarios"
            value={metrics?.totalUsers || 0}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Total Proyectos"
            value={metrics?.totalProjects || 0}
            color="info"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Total Documentos"
            value={metrics?.totalDocuments || 0}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Invitaciones Pendientes"
            value={metrics?.pendingInvitations || 0}
            color="warning"
          />
        </Grid>
      </Grid>
    </Box>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  color: 'primary' | 'info' | 'success' | 'warning';
}

function MetricCard({ title, value, color }: MetricCardProps) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: `${color}.lighter`,
              color: `${color}.main`,
            }}
          >
            <Iconify icon="solar:pen-bold" width={32} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
