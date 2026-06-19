import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { permissionService } from 'src/services/permissionService';
import { PermissionCheckbox } from 'src/components/permission-checkbox';
import type { UpdateAccessRequest } from 'src/types/permission';

interface GrantAccessModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  onAccessGranted: () => void;
  userId?: string;
  userName?: string;
  userEmail?: string;
  initialPermissions?: {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canDeprioritize: boolean;
    canInvite: boolean;
  };
}

export function GrantAccessModal({
  open,
  onClose,
  projectId,
  onAccessGranted,
  userId,
  userName,
  userEmail,
  initialPermissions,
}: GrantAccessModalProps) {
  const [permissions, setPermissions] = useState({
    canView: initialPermissions?.canView ?? true,
    canEdit: initialPermissions?.canEdit ?? false,
    canDelete: initialPermissions?.canDelete ?? false,
    canDeprioritize: initialPermissions?.canDeprioritize ?? false,
    canInvite: initialPermissions?.canInvite ?? false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial permissions when modal opens
  useEffect(() => {
    if (open && initialPermissions) {
      setPermissions({
        canView: initialPermissions.canView,
        canEdit: initialPermissions.canEdit,
        canDelete: initialPermissions.canDelete,
        canDeprioritize: initialPermissions.canDeprioritize,
        canInvite: initialPermissions.canInvite,
      });
    }
  }, [open, initialPermissions]);

  const handlePermissionChange = (permission: keyof typeof permissions, value: boolean) => {
    setPermissions((prev) => ({ ...prev, [permission]: value }));
  };

  const handleSubmit = async () => {
    if (!userId) {
      setError('No se especificó el usuario');
      return;
    }

    if (!permissions.canView) {
      setError('El permiso VER es obligatorio');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data: UpdateAccessRequest = {
        canView: permissions.canView,
        canEdit: permissions.canEdit,
        canDelete: permissions.canDelete,
        canDeprioritize: permissions.canDeprioritize,
        canInvite: permissions.canInvite,
      };
      await permissionService.updateAccess(projectId, userId, data);
      onAccessGranted();
      handleClose();
    } catch (err) {
      setError('Error al actualizar acceso. Por favor, intenta nuevamente.');
      console.error('Error updating access:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPermissions({
      canView: true,
      canEdit: false,
      canDelete: false,
      canDeprioritize: false,
      canInvite: false,
    });
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Acceso</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* User Info */}
        {userName && userEmail && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" fontWeight={600}>
              {userName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {userEmail}
            </Typography>
          </Box>
        )}

        {/* Permissions */}
        <PermissionCheckbox
          permissions={permissions}
          onChange={handlePermissionChange}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!userId || loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Guardar Cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
