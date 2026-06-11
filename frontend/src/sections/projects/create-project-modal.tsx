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
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { projectService } from 'src/services/projectService';
import { ProjectStatus, type CreateProjectRequest, type UpdateProjectRequest, type ProjectResponse } from 'src/types/project';

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
  project?: ProjectResponse;
  isEditMode?: boolean;
}

export function CreateProjectModal({ open, onClose, onProjectCreated, project, isEditMode = false }: CreateProjectModalProps) {
  const [formData, setFormData] = useState<CreateProjectRequest>({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && project) {
      setFormData({
        name: project.name,
        description: project.description,
      });
    } else {
      setFormData({ name: '', description: '' });
    }
  }, [open, isEditMode, project]);

  const handleChange = (field: keyof CreateProjectRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim() || formData.name.length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      return;
    }
    if (!formData.description.trim() || formData.description.length < 10) {
      setError('La descripción debe tener al menos 10 caracteres');
      return;
    }
    if (formData.name.length > 100) {
      setError('El nombre no puede exceder 100 caracteres');
      return;
    }
    if (formData.description.length > 500) {
      setError('La descripción no puede exceder 500 caracteres');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (isEditMode && project) {
        const updateData: UpdateProjectRequest = {
          name: formData.name,
          description: formData.description,
        };
        await projectService.updateProject(project.id, updateData);
      } else {
        await projectService.createProject(formData);
      }
      onProjectCreated();
      handleClose();
    } catch (err) {
      setError(isEditMode ? 'Error al actualizar el proyecto. Por favor, intenta nuevamente.' : 'Error al crear el proyecto. Por favor, intenta nuevamente.');
      console.error('Error saving project:', err);
    } finally {
      setLoading(false);
    }
  };


  const handleClose = () => {
    if (!isEditMode) {
      setFormData({ name: '', description: '' });
    }
    setError(null);
    onClose();
  };

  const isValid = formData.name.trim().length >= 3 && formData.description.trim().length >= 10;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditMode ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            autoFocus
            margin="dense"
            label="Nombre del Proyecto"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleChange('name')}
            error={formData.name.length > 100}
            helperText={`${formData.name.length}/100 caracteres`}
            disabled={loading}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Descripción"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={formData.description}
            onChange={handleChange('description')}
            error={formData.description.length > 500}
            helperText={`${formData.description.length}/500 caracteres`}
            disabled={loading}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={!isValid || loading}>
            {loading ? <CircularProgress size={20} /> : (isEditMode ? 'Guardar Cambios' : 'Crear Proyecto')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
