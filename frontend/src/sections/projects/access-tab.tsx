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
  Checkbox,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { permissionService } from 'src/services/permissionService';
import type { ProjectAccessResponse } from 'src/types/permission';
import { GrantAccessModal } from '../permissions/grant-access-modal';

interface AccessTabProps {
  projectId: string;
  canInvite: boolean;
  canGrantAccess: boolean;
}

export function AccessTab({ projectId, canInvite, canGrantAccess }: AccessTabProps) {
  const [accessList, setAccessList] = useState<ProjectAccessResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [grantModalOpen, setGrantModalOpen] = useState(false);

  const loadAccess = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await permissionService.getProjectAccess(projectId);
      setAccessList(data);
    } catch (err) {
      setError('Error al cargar accesos. Por favor, intenta nuevamente.');
      console.error('Error loading access:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccess();
  }, [projectId]);

  const handleRevokeAccess = async (userId: string) => {
    if (!confirm('¿Estás seguro de que deseas revocar el acceso a este usuario?')) {
      return;
    }

    try {
      await permissionService.revokeAccess(projectId, userId);
      loadAccess();
    } catch (err) {
      console.error('Error revoking access:', err);
    }
  };

  const handleAccessGranted = () => {
    loadAccess();
    setGrantModalOpen(false);
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
          Usuarios con acceso ({accessList.length})
        </Typography>
        {canInvite && (
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:add-bold" />}
            onClick={() => setGrantModalOpen(true)}
          >
            Otorgar Acceso
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Access Table */}
      {accessList.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <Iconify icon="solar:users-group-rounded-bold-duotone" width={64} sx={{ mb: 2, opacity: 0.5 }} />
          <Typography>No hay usuarios con acceso a este proyecto</Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Usuario</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Permisos</TableCell>
                <TableCell>Otorgado por</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accessList.map((access) => (
                <TableRow key={access.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {access.userName || access.userEmail}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {access.userEmail}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={access.userRole || 'Usuario'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {access.canView && <Chip label="Ver" size="small" color="success" />}
                      {access.canEdit && <Chip label="Editar" size="small" color="info" />}
                      {access.canDelete && <Chip label="Eliminar" size="small" color="error" />}
                      {access.canDeprioritize && <Chip label="Despriorizar" size="small" color="warning" />}
                      {access.canInvite && <Chip label="Invitar" size="small" color="primary" />}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {access.grantedByName || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(access.grantedAt).toLocaleDateString('es-ES')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {canGrantAccess && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRevokeAccess(access.userId)}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Grant Access Modal */}
      <GrantAccessModal
        open={grantModalOpen}
        onClose={() => setGrantModalOpen(false)}
        projectId={projectId}
        onAccessGranted={handleAccessGranted}
      />
    </Box>
  );
}
