import { useState } from 'react';
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
import type { GrantAccessRequest } from 'src/types/permission';

interface GrantAccessModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  onAccessGranted: () => void;
}

export function GrantAccessModal({
  open,
  onClose,
  projectId,
  onAccessGranted,
}: GrantAccessModalProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [permissions, setPermissions] = useState({
    canView: true,
    canEdit: false,
    canDelete: false,
    canDeprioritize: false,
    canInvite: false,
  });
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      // TODO: Implement user search API
      // For now, mock search results
      const mockResults = [
        { id: '1', name: 'Juan Pérez', email: 'juan@example.com', role: 'ASESOR' },
        { id: '2', name: 'María García', email: 'maria@example.com', role: 'INVITADO' },
        { id: '3', name: 'Carlos López', email: 'carlos@example.com', role: 'ASESOR' },
      ].filter((user) =>
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(mockResults);
    } catch (err) {
      console.error('Error searching users:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectUser = (user: any) => {
    setSelectedUserId(user.id);
    setSearchResults([]);
  };

  const handleRemoveUser = () => {
    setSelectedUserId('');
  };

  const handlePermissionChange = (permission: keyof typeof permissions, value: boolean) => {
    setPermissions((prev) => ({ ...prev, [permission]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedUserId) {
      setError('Debes seleccionar un usuario');
      return;
    }

    if (!permissions.canView) {
      setError('El permiso VER es obligatorio');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data: GrantAccessRequest = {
        userId: selectedUserId,
        ...permissions,
      };
      await permissionService.grantAccess(projectId, data);
      onAccessGranted();
      handleClose();
    } catch (err) {
      setError('Error al otorgar acceso. Por favor, intenta nuevamente.');
      console.error('Error granting access:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedUserId('');
    setPermissions({
      canView: true,
      canEdit: false,
      canDelete: false,
      canDeprioritize: false,
      canInvite: false,
    });
    setSearchResults([]);
    setError(null);
    onClose();
  };

  const selectedUser = searchResults.find((u) => u.id === selectedUserId);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Otorgar Acceso</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Search User */}
        <TextField
          fullWidth
          label="Buscar usuario por email o nombre"
          placeholder="Escribe para buscar..."
          onChange={(e) => handleSearchUsers(e.target.value)}
          disabled={loading}
          sx={{ mb: 2, mt: 1 }}
        />

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Box sx={{ mb: 2, maxHeight: 200, overflowY: 'auto' }}>
            {searchResults.map((user) => (
              <Box
                key={user.id}
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'grey.50' },
                }}
                onClick={() => handleSelectUser(user)}
              >
                <Typography variant="body2" fontWeight={600}>
                  {user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email}
                </Typography>
                <Chip label={user.role} size="small" sx={{ mt: 1 }} />
              </Box>
            ))}
          </Box>
        )}

        {/* Selected User */}
        {selectedUser && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.lighter', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {selectedUser.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedUser.email}
                </Typography>
              </Box>
              <Button size="small" onClick={handleRemoveUser}>
                Cambiar
              </Button>
            </Box>
          </Box>
        )}

        {/* Permissions */}
        <PermissionCheckbox
          permissions={permissions}
          onChange={handlePermissionChange}
          disabled={loading}
        />

        {/* Preview */}
        {selectedUser && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {selectedUser.name} tendrá permisos:{' '}
              {Object.entries(permissions)
                .filter(([_, value]) => value)
                .map(([key]) => key.toUpperCase())
                .join(', ')}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!selectedUserId || loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Otorgar Acceso'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
