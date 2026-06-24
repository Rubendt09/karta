import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

import { useAuth } from 'src/context/AuthContext';

// ----------------------------------------------------------------------

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const { user, refreshUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setError('');
      setLoading(true);
      refreshUser()
        .catch((err) => {
          setError(err.response?.data?.message || 'Error al cargar el perfil');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, refreshUser]);

  const handleClose = useCallback(() => {
    setError('');
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Perfil de usuario</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {loading && <CircularProgress size={24} sx={{ alignSelf: 'center' }} />}
          {error && <Alert severity="error">{error}</Alert>}

          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Nombre
            </Typography>
            <Typography variant="body1">{user?.name || 'N/A'}</Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Correo electrónico
            </Typography>
            <Typography variant="body1">{user?.email || 'N/A'}</Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Rol
            </Typography>
            <Typography variant="body1">{user?.role || 'N/A'}</Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
