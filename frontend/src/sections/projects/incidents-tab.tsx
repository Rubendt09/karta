import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { incidentService } from 'src/services/incidentService';
import { documentService } from 'src/services/documentService';
import { RegisterIncidentModal } from './register-incident-modal';
import type { Incident } from 'src/types/incident';
import type { DocumentResponse } from 'src/types/document';

interface IncidentsTabProps {
  projectId: string;
  canEdit: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  pérdida: 'Pérdida',
  daño: 'Daño',
};

export function IncidentsTab({ projectId, canEdit }: IncidentsTabProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const documentsData = await documentService.getDocumentsByProject(projectId);
      setDocuments(documentsData);

      try {
        const incidentsData = await incidentService.getProjectIncidents(projectId);
        setIncidents(incidentsData);
      } catch (incidentErr) {
        setError('Error al cargar incidentes.');
        console.error('Error loading incidents:', incidentErr);
      }
    } catch (err) {
      setError('Error al cargar datos del proyecto.');
      console.error('Error loading project data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const getDocumentName = (documentId?: string) => {
    if (!documentId) return 'Sin documento';
    const doc = documents.find((d) => d.id === documentId);
    return doc ? doc.name : 'Documento desconocido';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Incidentes registrados</Typography>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:add-bold" />}
            onClick={() => setModalOpen(true)}
          >
            Registrar Incidente
          </Button>
        )}
      </Box>

      {incidents.length === 0 ? (
        <Typography color="text.secondary">No hay incidentes registrados.</Typography>
      ) : (
        <List>
          {incidents.map((incident) => (
            <ListItem
              key={incident.id}
              divider
              secondaryAction={
                <Typography variant="caption" color="text.secondary">
                  {new Date(incident.reportedAt).toLocaleString()}
                </Typography>
              }
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip
                      label={TYPE_LABELS[incident.incidentType] || incident.incidentType}
                      color="error"
                      size="small"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {getDocumentName(incident.documentId)}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      <RegisterIncidentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        projectId={projectId}
        documents={documents}
        onIncidentRegistered={loadData}
      />
    </Box>
  );
}
