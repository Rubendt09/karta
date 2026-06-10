import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  CircularProgress,
  Alert,
  Checkbox,
} from '@mui/material';
import { projectService } from 'src/services/projectService';
import { ProjectStatus, type ChangeProjectStatusRequest } from 'src/types/project';

interface ChangeStatusModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  currentStatus: ProjectStatus;
  onStatusChanged: () => void;
}

export function ChangeStatusModal({
  open,
  onClose,
  projectId,
  currentStatus,
  onStatusChanged,
}: ChangeStatusModalProps) {
  const [newStatus, setNewStatus] = useState<ProjectStatus>(currentStatus);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusDescriptions: Record<ProjectStatus, string> = {
    [ProjectStatus.ACTIVO]: 'El proyecto es visible y editable para todos los usuarios con acceso',
    [ProjectStatus.DESPRIORIZADO]: 'El proyecto sigue accesible pero con menor prioridad en listados',
    [ProjectStatus.ARCHIVADO]: 'El proyecto es de solo lectura, no se pueden realizar cambios',
  };

  const handleSubmit = async () => {
    if (!confirmed) {
      setError('Debes confirmar que entiendes el impacto de esta acción');
      return;
    }

    if (newStatus === currentStatus) {
      setError('Selecciona un estado diferente al actual');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data: ChangeProjectStatusRequest = { status: newStatus };
      await projectService.changeProjectStatus(projectId, data);
      onStatusChanged();
      handleClose();
    } catch (err) {
      setError('Error al cambiar el estado del proyecto. Por favor, intenta nuevamente.');
      console.error('Error changing project status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewStatus(currentStatus);
    setConfirmed(false);
    setError(null);
    onClose();
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ACTIVO:
        return 'success';
      case ProjectStatus.DESPRIORIZADO:
        return 'warning';
      case ProjectStatus.ARCHIVADO:
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cambiar Estado del Proyecto</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Estado actual:
          </Typography>
          <Typography variant="subtitle1" fontWeight={600}>
            {currentStatus}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Nuevo estado:
          </Typography>
          <RadioGroup value={newStatus} onChange={(e) => setNewStatus(e.target.value as ProjectStatus)}>
            <FormControlLabel
              value={ProjectStatus.ACTIVO}
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body2">Activo</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {statusDescriptions[ProjectStatus.ACTIVO]}
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value={ProjectStatus.DESPRIORIZADO}
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body2">Despriorizado</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {statusDescriptions[ProjectStatus.DESPRIORIZADO]}
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value={ProjectStatus.ARCHIVADO}
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body2">Archivado</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {statusDescriptions[ProjectStatus.ARCHIVADO]}
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {statusDescriptions[newStatus]}
          </Typography>
        </Box>

        <Box sx={{ mt: 3 }}>
          <FormControlLabel
            control={<Checkbox checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />}
            label="Entiendo que esta acción afectará a todos los usuarios con acceso"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!confirmed || newStatus === currentStatus || loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Cambiar Estado'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
