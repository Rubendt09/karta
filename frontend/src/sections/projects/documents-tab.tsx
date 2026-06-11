import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { documentService } from 'src/services/documentService';
import type { DocumentResponse, Priority } from 'src/types/document';
import { Priority as PriorityEnum } from 'src/types/document';
import { UploadDocumentModal } from '../documents/upload-modal';
import { EditDocumentModal } from '../documents/edit-modal';
import { DeleteDocumentModal } from '../documents/delete-document-modal';

interface DocumentsTabProps {
  projectId: string;
  canEdit: boolean;
  canDelete: boolean;
}

export function DocumentsTab({ projectId, canEdit, canDelete }: DocumentsTabProps) {
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [selectedDocumentName, setSelectedDocumentName] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<Priority | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await documentService.getDocumentsByProject(projectId);
      setDocuments(data);
    } catch (err) {
      setError('Error al cargar documentos. Por favor, intenta nuevamente.');
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [projectId]);

  const handleDocumentUploaded = () => {
    loadDocuments();
  };

  const handleDocumentUpdated = () => {
    loadDocuments();
  };

  const handleDocumentDeleted = () => {
    loadDocuments();
  };

  const handleEditDocument = (documentId: string) => {
    setSelectedDocumentId(documentId);
    setEditModalOpen(true);
  };

  const handleDownload = async (documentId: string, documentName: string) => {
    try {
      const blob = await documentService.downloadDocument(projectId, documentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = documentName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading document:', err);
    }
  };

  const handleDelete = (documentId: string, documentName: string) => {
    setSelectedDocumentId(documentId);
    setSelectedDocumentName(documentName);
    setDeleteModalOpen(true);
  };

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesPriority = filterPriority === 'ALL' || doc.priority === filterPriority;
    const matchesSearch =
      searchQuery === '' || doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case PriorityEnum.ALTA:
        return 'error';
      case PriorityEnum.MEDIA:
        return 'warning';
      case PriorityEnum.BAJA:
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityLabel = (priority: Priority) => {
    switch (priority) {
      case PriorityEnum.ALTA:
        return 'Alta';
      case PriorityEnum.MEDIA:
        return 'Media';
      case PriorityEnum.BAJA:
        return 'Baja';
      default:
        return priority;
    }
  };

  const getFileIcon = (fileName: string) => 'solar:file-bold';

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Buscar documentos..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: 250 }}
          />
          <TextField
            select
            size="small"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as Priority | 'ALL')}
            sx={{ width: 150 }}
          >
            <MenuItem value="ALL">Todas</MenuItem>
            <MenuItem value={PriorityEnum.ALTA}>Alta</MenuItem>
            <MenuItem value={PriorityEnum.MEDIA}>Media</MenuItem>
            <MenuItem value={PriorityEnum.BAJA}>Baja</MenuItem>
          </TextField>
        </Box>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:add-bold" />}
            onClick={() => setUploadModalOpen(true)}
          >
            Subir Documento
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <Iconify icon="solar:file-bold-duotone" width={64} sx={{ mb: 2, opacity: 0.5 }} />
          <Typography>No hay documentos en este proyecto</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredDocuments.map((doc) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={doc.id}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: (theme) => theme.shadows[4],
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'primary.lighter',
                        color: 'primary.main',
                      }}
                    >
                      <Iconify icon="solar:pen-bold" width={32} />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                      <Chip
                        label={getPriorityLabel(doc.priority)}
                        size="small"
                        color={getPriorityColor(doc.priority) as any}
                        sx={{
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      />
                    </Box>
                  </Box>

                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    {doc.name}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2, color: 'text.secondary', mb: 2, fontSize: 12 }}>
                    <Box>{formatFileSize(doc.fileSize)}</Box>
                    <Box>•</Box>
                    <Box>{new Date(doc.createdAt).toLocaleDateString('es-ES')}</Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Iconify icon="solar:download-minimalistic-bold" />}
                      onClick={() => handleDownload(doc.id, doc.name)}
                      fullWidth
                    >
                      Descargar
                    </Button>
                    {canEdit && (
                      <IconButton
                        size="small"
                        onClick={() => handleEditDocument(doc.id)}
                      >
                        <Iconify icon="solar:pen-bold" />
                      </IconButton>
                    )}
                    {canDelete && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(doc.id, doc.name)}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Upload Modal */}
      <UploadDocumentModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        projectId={projectId}
        onDocumentUploaded={handleDocumentUploaded}
      />

      {/* Edit Modal */}
      {selectedDocumentId && (
        <EditDocumentModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          documentId={selectedDocumentId}
          projectId={projectId}
          onDocumentUpdated={handleDocumentUpdated}
        />
      )}

      {/* Delete Modal */}
      {selectedDocumentId && selectedDocumentName && (
        <DeleteDocumentModal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          projectId={projectId}
          documentId={selectedDocumentId}
          documentName={selectedDocumentName}
          onDocumentDeleted={handleDocumentDeleted}
        />
      )}
    </Box>
  );
}
