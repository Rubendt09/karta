import { useState, useCallback } from 'react';
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
  LinearProgress,
  Paper,
} from '@mui/material';
import { documentService } from 'src/services/documentService';
import { Priority, type UploadDocumentRequest } from 'src/types/document';

interface UploadDocumentModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  onDocumentUploaded: () => void;
}

export function UploadDocumentModal({
  open,
  onClose,
  projectId,
  onDocumentUploaded,
}: UploadDocumentModalProps) {
  const [formData, setFormData] = useState<UploadDocumentRequest>({
    file: null as any,
    name: '',
    priority: Priority.MEDIA,
    description: '',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (file: File) => {
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo excede el tamaño máximo de 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
    ];
    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de archivo no permitido. Solo se aceptan PDF, DOCX, XLSX, JPG y PNG');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      file,
      name: file.name,
    }));
    setError(null);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleChange = (field: keyof UploadDocumentRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.file) {
      setError('Debes seleccionar un archivo');
      return;
    }

    if (!formData.name.trim()) {
      setError('El nombre del documento es requerido');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setUploadProgress(0);

      // Simulate progress (in real implementation, you'd use axios upload progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await documentService.uploadDocument(projectId, formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        onDocumentUploaded();
        handleClose();
      }, 500);
    } catch (err) {
      setError('Error al subir el documento. Por favor, intenta nuevamente.');
      console.error('Error uploading document:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      file: null as any,
      name: '',
      priority: Priority.MEDIA,
      description: '',
    });
    setUploadProgress(0);
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

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return '📄';
      case 'docx':
        return '📝';
      case 'xlsx':
        return '📊';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return '🖼️';
      default:
        return '📎';
    }
  };

  const isValid = formData.file && formData.name.trim().length > 0;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Subir Documento</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Drag & Drop Zone */}
          <Paper
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            sx={{
              p: 4,
              mb: 3,
              border: 2,
              borderColor: dragActive ? 'primary.main' : 'divider',
              borderStyle: 'dashed',
              bgcolor: dragActive ? 'primary.lighter' : 'transparent',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              hidden
              onChange={handleFileInputChange}
              accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png"
            />
            {formData.file ? (
              <Box>
                <Typography variant="h4" sx={{ mb: 1 }}>
                  {getFileIcon(formData.file.name)}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {formData.file.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(formData.file.size)}
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography variant="h4" sx={{ mb: 1, opacity: 0.5 }}>
                  📤
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Arrastra y suelta tu archivo aquí
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  o haz clic para seleccionar
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                  Máximo 10MB. Formatos: PDF, DOCX, XLSX, JPG, PNG
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Document Name */}
          <TextField
            margin="dense"
            label="Nombre del Documento"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleChange('name')}
            disabled={uploading}
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
            disabled={uploading}
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
            rows={2}
            variant="outlined"
            value={formData.description}
            onChange={handleChange('description')}
            disabled={uploading}
          />

          {/* Upload Progress */}
          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {uploadProgress}%
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={uploading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={!isValid || uploading}>
            {uploading ? <CircularProgress size={20} /> : 'Subir'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
