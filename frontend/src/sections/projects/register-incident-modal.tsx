import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  CircularProgress,
  Alert,
  MenuItem,
} from '@mui/material';
import { incidentService } from 'src/services/incidentService';
import type { DocumentResponse } from 'src/types/document';

interface RegisterIncidentModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  documents: DocumentResponse[];
  onIncidentRegistered: () => void;
}

const INCIDENT_TYPES = [
  { value: 'pérdida', label: 'Pérdida de documento' },
  { value: 'daño', label: 'Daño / Corrupción' },
];

export function RegisterIncidentModal({
  open,
  onClose,
  projectId,
  documents,
  onIncidentRegistered,
}: RegisterIncidentModalProps) {
  const [incidentType, setIncidentType] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setIncidentType('');
    setDocumentId('');
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!incidentType) {
      setError('Selecciona un tipo de incidente');
      return;
    }

    if (!documentId) {
      setError('Selecciona el documento afectado');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await incidentService.createIncident(projectId, {
        projectId,
        documentId,
        incidentType,
      });
      onIncidentRegistered();
      handleClose();
    } catch (err) {
      setError('Error al registrar el incidente. Por favor, intenta nuevamente.');
      console.error('Error registering incident:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Registrar Incidente</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Tipo de incidente
          </Typography>
          <TextField
            select
            fullWidth
            value={incidentType}
            onChange={(e) => setIncidentType(e.target.value)}
            disabled={loading}
          >
            {INCIDENT_TYPES.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Documento afectado (obligatorio)
          </Typography>
          <TextField
            select
            fullWidth
            value={documentId}
            onChange={(e) => setDocumentId(e.target.value)}
            disabled={loading}
          >
            {documents.map((doc) => (
              <MenuItem key={doc.id} value={doc.id}>
                {doc.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!incidentType || !documentId || loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Registrar Incidente'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
