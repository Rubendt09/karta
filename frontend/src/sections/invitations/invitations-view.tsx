import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Grid,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { invitationService } from 'src/services/invitationService';
import { InvitationStatus, type InvitationResponse } from 'src/types/invitation';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export function InvitationsView() {
  const [invitations, setInvitations] = useState<InvitationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await invitationService.getMyInvitations();
      setInvitations(data);
    } catch (err) {
      setError('Error al cargar invitaciones. Por favor, intenta nuevamente.');
      console.error('Error loading invitations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAccept = async (projectId: string, invitationId: string) => {
    try {
      await invitationService.acceptInvitation(projectId, invitationId);
      loadInvitations();
    } catch (err) {
      console.error('Error accepting invitation:', err);
      alert('Error al aceptar la invitación. Por favor, intenta nuevamente.');
    }
  };

  const handleReject = async (projectId: string, invitationId: string) => {
    if (!confirm('¿Estás seguro de que deseas rechazar esta invitación?')) {
      return;
    }

    try {
      await invitationService.rejectInvitation(projectId, invitationId);
      loadInvitations();
    } catch (err) {
      console.error('Error rejecting invitation:', err);
    }
  };

  const getStatusColor = (status: InvitationStatus) => {
    switch (status) {
      case 'PENDIENTE':
        return 'warning';
      case 'ACEPTADA':
        return 'success';
      case 'RECHAZADA':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: InvitationStatus) => {
    switch (status) {
      case 'PENDIENTE':
        return 'Pendiente';
      case 'ACEPTADA':
        return 'Aceptada';
      case 'RECHAZADA':
        return 'Rechazada';
      default:
        return status;
    }
  };

  const getDaysUntilExpiration = (expiresAt: string) => {
    const now = new Date();
    const expiration = new Date(expiresAt);
    const diffTime = expiration.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filterByStatus = (status: InvitationStatus | 'ALL') => {
    if (status === 'ALL') return invitations;
    return invitations.filter((inv) => inv.status === status);
  };

  const pendingCount = invitations.filter((inv) => inv.status === 'PENDIENTE').length;
  const acceptedCount = invitations.filter((inv) => inv.status === 'ACEPTADA').length;
  const rejectedCount = invitations.filter((inv) => inv.status === 'RECHAZADA').length;

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
        Mis Invitaciones
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={`Pendientes (${pendingCount})`} />
          <Tab label={`Aceptadas (${acceptedCount})`} />
          <Tab label={`Rechazadas (${rejectedCount})`} />
          <Tab label={`Todas (${invitations.length})`} />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <InvitationList
          invitations={filterByStatus(InvitationStatus.PENDIENTE)}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <InvitationList invitations={filterByStatus(InvitationStatus.ACEPTADA)} />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <InvitationList invitations={filterByStatus(InvitationStatus.RECHAZADA)} />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <InvitationList
          invitations={filterByStatus('ALL')}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      </TabPanel>
    </Box>
  );
}

interface InvitationListProps {
  invitations: InvitationResponse[];
  onAccept?: (projectId: string, id: string) => void;
  onReject?: (projectId: string, id: string) => void;
}

function InvitationList({ invitations, onAccept, onReject }: InvitationListProps) {
  const getStatusColor = (status: InvitationStatus) => {
    switch (status) {
      case InvitationStatus.PENDIENTE:
        return 'warning';
      case InvitationStatus.ACEPTADA:
        return 'success';
      case InvitationStatus.RECHAZADA:
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: InvitationStatus) => {
    switch (status) {
      case InvitationStatus.PENDIENTE:
        return 'Pendiente';
      case InvitationStatus.ACEPTADA:
        return 'Aceptada';
      case InvitationStatus.RECHAZADA:
        return 'Rechazada';
      default:
        return status;
    }
  };

  const getDaysUntilExpiration = (expiresAt: string) => {
    const now = new Date();
    const expiration = new Date(expiresAt);
    const diffTime = expiration.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (invitations.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
        <Iconify icon="solar:file-bold-duotone" width={64} sx={{ mb: 2, opacity: 0.5 }} />
        <Typography>No hay invitaciones</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {invitations.map((invitation) => (
        <Grid size={{ xs: 12, md: 6 }} key={invitation.id}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {invitation.projectName || 'Proyecto'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {invitation.email}
                  </Typography>
                </Box>
                <Chip
                  label={getStatusLabel(invitation.status)}
                  size="small"
                  color={getStatusColor(invitation.status) as any}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Permisos:{' '}
                  {invitation.permissions?.canView && 'Ver '}
                  {invitation.permissions?.canEdit && 'Editar '}
                  {invitation.permissions?.canDelete && 'Eliminar '}
                  {invitation.permissions?.canDeprioritize && 'Despriorizar '}
                  {invitation.permissions?.canInvite && 'Invitar'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Expira en:{' '}
                  {invitation.status === InvitationStatus.PENDIENTE
                    ? `${getDaysUntilExpiration(invitation.expiresAt)} días`
                    : '-'}
                </Typography>
              </Box>

              {invitation.status === InvitationStatus.PENDIENTE && onAccept && onReject && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => onAccept(invitation.projectId, invitation.id)}
                    fullWidth
                  >
                    Aceptar
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => onReject(invitation.projectId, invitation.id)}
                  >
                    Rechazar
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
