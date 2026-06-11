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
import { documentService } from 'src/services/documentService';

interface DeleteDocumentModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  documentId: string;
  documentName: string;
  onDocumentDeleted: () => void;
}

export function DeleteDocumentModal({ open, onClose, projectId, documentId, documentName, onDocumentDeleted }: DeleteDocumentModalProps) {
  const [confirmName, setConfirmName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (confirmName !== documentName) {
      setError('El nombre ingresado no coincide con el nombre del documento');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await documentService.deleteDocument(projectId, documentId);
      onDocumentDeleted();
      handleClose();
    } catch (err) {
      setError('Error al eliminar el documento. Por favor, intenta nuevamente.');
      console.error('Error deleting document:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmName('');
    setError(null);
    onClose();
  };

  const isValid = confirmName === documentName;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Eliminar Documento</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Typography variant="body1" sx={{ mb: 2 }}>
            ¿Estás seguro de que deseas eliminar el documento <strong>{documentName}</strong>? Esta acción no se puede deshacer.
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Para confirmar, escribe el nombre del documento:
          </Typography>

          <TextField
            autoFocus
            margin="dense"
            label="Nombre del documento"
            fullWidth
            variant="outlined"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            disabled={loading}
            placeholder={documentName}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="error" disabled={!isValid || loading}>
            {loading ? <CircularProgress size={20} /> : 'Eliminar Documento'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
