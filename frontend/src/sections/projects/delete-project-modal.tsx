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
} from '@mui/material';
import { projectService } from 'src/services/projectService';

interface DeleteProjectModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  onProjectDeleted: () => void;
}

export function DeleteProjectModal({ open, onClose, projectId, projectName, onProjectDeleted }: DeleteProjectModalProps) {
  const [confirmName, setConfirmName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (confirmName !== projectName) {
      setError('El nombre ingresado no coincide con el nombre del proyecto');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await projectService.deleteProject(projectId);
      onProjectDeleted();
      handleClose();
    } catch (err) {
      setError('Error al eliminar el proyecto. Por favor, intenta nuevamente.');
      console.error('Error deleting project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmName('');
    setError(null);
    onClose();
  };

  const isValid = confirmName === projectName;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Eliminar Proyecto</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Typography variant="body1" sx={{ mb: 2 }}>
            ¿Estás seguro de que deseas eliminar el proyecto <strong>{projectName}</strong>? Esta acción no se puede deshacer.
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Para confirmar, escribe el nombre del proyecto:
          </Typography>

          <TextField
            autoFocus
            margin="dense"
            label="Nombre del proyecto"
            fullWidth
            variant="outlined"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            disabled={loading}
            placeholder={projectName}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="error" disabled={!isValid || loading}>
            {loading ? <CircularProgress size={20} /> : 'Eliminar Proyecto'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
