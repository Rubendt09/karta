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
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { invitationService } from 'src/services/invitationService';
import { PermissionCheckbox } from 'src/components/permission-checkbox';
import type { CreateInvitationRequest } from 'src/types/invitation';

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  onInvitationSent: () => void;
}

export function InviteModal({ open, onClose, projectId, onInvitationSent }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [expirationDays, setExpirationDays] = useState(7);
  const [permissions, setPermissions] = useState({
    canView: true,
    canEdit: false,
    canDelete: false,
    canDeprioritize: false,
    canInvite: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePermissionChange = (permission: keyof typeof permissions, value: boolean) => {
    setPermissions((prev) => ({ ...prev, [permission]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!email.trim() || !email.includes('@')) {
      setError('Por favor, ingresa un email válido');
      return;
    }

    if (!permissions.canView) {
      setError('El permiso VER es obligatorio');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data: CreateInvitationRequest = {
        email: email.trim(),
        projectId,
        message: message.trim(),
        expirationDays,
        ...permissions,
      };
      await invitationService.createInvitation(data);
      onInvitationSent();
      handleClose();
    } catch (err) {
      setError('Error al enviar invitación. Por favor, intenta nuevamente.');
      console.error('Error sending invitation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setMessage('');
    setExpirationDays(7);
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

  const isValid = email.trim().includes('@') && permissions.canView;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Invitar Usuario</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Email */}
          <TextField
            margin="dense"
            label="Email del usuario"
            fullWidth
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
          />

          {/* Message */}
          <TextField
            margin="dense"
            label="Mensaje personal (opcional)"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
            placeholder="Añade un mensaje personalizado para el invitado..."
            sx={{ mb: 2 }}
          />

          {/* Expiration */}
          <TextField
            margin="dense"
            label="Expiración de la invitación"
            fullWidth
            select
            variant="outlined"
            value={expirationDays}
            onChange={(e) => setExpirationDays(Number(e.target.value))}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            <MenuItem value={7}>7 días</MenuItem>
            <MenuItem value={14}>14 días</MenuItem>
            <MenuItem value={30}>30 días</MenuItem>
          </TextField>

          {/* Permissions */}
          <PermissionCheckbox
            permissions={permissions}
            onChange={handlePermissionChange}
            disabled={loading}
          />

          {/* Preview */}
          {email && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Se enviará una invitación a <strong>{email}</strong> con permisos:{' '}
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
          <Button type="submit" variant="contained" disabled={!isValid || loading}>
            {loading ? <CircularProgress size={20} /> : 'Enviar Invitación'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
