import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { invitationService } from 'src/services/invitationService';
import type { InvitationResponse, InvitationStatus } from 'src/types/invitation';
import { InviteModal } from '../invitations/invite-modal';

interface InvitationsTabProps {
  projectId: string;
  canInvite: boolean;
}

export function InvitationsTab({ projectId, canInvite }: InvitationsTabProps) {
  const [invitations, setInvitations] = useState<InvitationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await invitationService.getProjectInvitations(projectId);
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
  }, [projectId]);

  const handleInvitationSent = () => {
    loadInvitations();
    setInviteModalOpen(false);
  };

  const handleResend = async (invitationId: string) => {
    try {
      // TODO: Implement resend invitation API
      console.log('Resend invitation:', invitationId);
    } catch (err) {
      console.error('Error resending invitation:', err);
    }
  };

  const handleCancel = async (invitationId: string) => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta invitación?')) {
      return;
    }

    try {
      // TODO: Implement cancel invitation API
      console.log('Cancel invitation:', invitationId);
      loadInvitations();
    } catch (err) {
      console.error('Error canceling invitation:', err);
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Invitaciones ({invitations.length})
        </Typography>
        {canInvite && (
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:add-bold" />}
            onClick={() => setInviteModalOpen(true)}
          >
            Invitar Usuario
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Invitations Table */}
      {invitations.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <Iconify icon="solar:file-bold-duotone" width={64} sx={{ mb: 2, opacity: 0.5 }} />
          <Typography>No hay invitaciones pendientes</Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Permisos</TableCell>
                <TableCell>Enviada por</TableCell>
                <TableCell>Expira en</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell>
                    <Typography variant="body2">{invitation.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(invitation.status)}
                      size="small"
                      color={getStatusColor(invitation.status) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {invitation.permissions?.canView && <Chip label="Ver" size="small" />}
                      {invitation.permissions?.canEdit && <Chip label="Editar" size="small" />}
                      {invitation.permissions?.canDelete && <Chip label="Eliminar" size="small" />}
                      {invitation.permissions?.canDeprioritize && <Chip label="Despriorizar" size="small" />}
                      {invitation.permissions?.canInvite && <Chip label="Invitar" size="small" />}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {invitation.invitedByName || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {invitation.status === 'PENDIENTE'
                        ? `${getDaysUntilExpiration(invitation.expiresAt)} días`
                        : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {invitation.status === 'PENDIENTE' && (
                      <>
                        <IconButton size="small" onClick={() => handleResend(invitation.id)}>
                          <Iconify icon="solar:restart-bold" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleCancel(invitation.id)}>
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Invite Modal */}
      <InviteModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        projectId={projectId}
        onInvitationSent={handleInvitationSent}
      />
    </Box>
  );
}
