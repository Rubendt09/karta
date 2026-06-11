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
import { documentService } from 'src/services/documentService';
import { Priority, type UpdateDocumentRequest, type DocumentResponse } from 'src/types/document';

interface EditDocumentModalProps {
  open: boolean;
  onClose: () => void;
  documentId: string;
  projectId: string;
  onDocumentUpdated: () => void;
}

export function EditDocumentModal({
  open,
  onClose,
  documentId,
  projectId,
  onDocumentUpdated,
}: EditDocumentModalProps) {
  const [document, setDocument] = useState<DocumentResponse | null>(null);
  const [formData, setFormData] = useState<UpdateDocumentRequest>({
    name: '',
    priority: Priority.MEDIA,
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDocument = async () => {
    if (!documentId || !projectId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await documentService.getDocumentById(projectId, documentId);
      setDocument(data);
      setFormData({
        name: data.name,
        priority: data.priority,
        description: data.description || '',
      });
    } catch (err) {
      setError('Error al cargar el documento. Por favor, intenta nuevamente.');
      console.error('Error loading document:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadDocument();
    }
  }, [open, documentId]);

  const handleChange = (field: keyof UpdateDocumentRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.name.trim()) {
      setError('El nombre del documento es requerido');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await documentService.updateDocument(projectId, documentId, formData);
      onDocumentUpdated();
      handleClose();
    } catch (err) {
      setError('Error al actualizar el documento. Por favor, intenta nuevamente.');
      console.error('Error updating document:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setDocument(null);
    setFormData({
      name: '',
      priority: Priority.MEDIA,
      description: '',
    });
    setError(null);
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogContent sx={{ py: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Documento</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Document Info (read-only) */}
          {document && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Información del archivo
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, fontSize: 13, color: 'text.secondary' }}>
                <Box>Nombre: {document.name}</Box>
                <Box>•</Box>
                <Box>Tamaño: {formatFileSize(document.fileSize)}</Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, fontSize: 13, color: 'text.secondary', mt: 0.5 }}>
                <Box>Tipo: {document.mimeType}</Box>
                <Box>•</Box>
                <Box>Subido: {new Date(document.createdAt).toLocaleDateString('es-ES')}</Box>
              </Box>
            </Box>
          )}

          {/* Name */}
          <TextField
            margin="dense"
            label="Nombre del Documento"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleChange('name')}
            disabled={saving}
            sx={{ mb: 2 }}
          />

          {/* Priority */}
          <TextField
            margin="dense"
            label="Prioridad"
            fullWidth
            select
            variant="outlined"
            value={formData.priority}
            onChange={handleChange('priority')}
            disabled={saving}
            sx={{ mb: 2 }}
          >
            <MenuItem value={Priority.ALTA}>Alta</MenuItem>
            <MenuItem value={Priority.MEDIA}>Media</MenuItem>
            <MenuItem value={Priority.BAJA}>Baja</MenuItem>
          </TextField>

          {/* Description */}
          <TextField
            margin="dense"
            label="Descripción (opcional)"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.description}
            onChange={handleChange('description')}
            disabled={saving}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={!formData.name || !formData.name.trim() || saving}>
            {saving ? <CircularProgress size={20} /> : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
