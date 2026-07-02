import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Fab,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { projectService } from 'src/services/projectService';
import { permissionService } from 'src/services/permissionService';
import { ProjectStatus, type ProjectResponse } from 'src/types/project';
import type { UserPermissions } from 'src/types/permission';
import { ChangeStatusModal } from './change-status-modal';
import { DeleteProjectModal } from './delete-project-modal';
import { CreateProjectModal } from './create-project-modal';
import { DocumentsTab } from './documents-tab';
import { AccessTab } from './access-tab';
import { InvitationsTab } from './invitations-tab';
import { ProjectChat } from './project-chat';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export function ProjectDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [changeStatusModalOpen, setChangeStatusModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const loadProject = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const [projectData, permissionsData] = await Promise.all([
        projectService.getProjectById(id),
        permissionService.getUserPermissions(id),
      ]);
      setProject(projectData);
      setPermissions(permissionsData);
    } catch (err) {
      setError('Error al cargar el proyecto. Es posible que no tengas acceso.');
      console.error('Error loading project:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleStatusChanged = () => {
    loadProject();
    setChangeStatusModalOpen(false);
  };

  const handleProjectDeleted = () => {
    navigate('/projects');
  };

  const handleProjectUpdated = () => {
    loadProject();
    setEditModalOpen(false);
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

  const getStatusLabel = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ACTIVO:
        return 'Activo';
      case ProjectStatus.DESPRIORIZADO:
        return 'Despriorizado';
      case ProjectStatus.ARCHIVADO:
        return 'Archivado';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Proyecto no encontrado'}
        </Alert>
        <Button variant="outlined" onClick={() => navigate('/projects')}>
          Volver a Mis Proyectos
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/projects" sx={{ cursor: 'pointer' }}>
          Mis Proyectos
        </Link>
        <Typography color="text.primary">{project.name}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 2 }}>
            {project.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Chip
              label={getStatusLabel(project.status)}
              color={getStatusColor(project.status) as any}
              size="small"
            />
            <Chip label={`${project.documentCount || 0} documentos`} size="small" variant="outlined" />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {permissions?.canEdit && (
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:pen-bold" />}
              onClick={() => setEditModalOpen(true)}
            >
              Editar
            </Button>
          )}
          {permissions?.canDeprioritize && (
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:restart-bold" />}
              onClick={() => setChangeStatusModalOpen(true)}
            >
              Cambiar Estado
            </Button>
          )}
          {/**permissions?.canInvite && (
            <Button variant="outlined" startIcon={<Iconify icon="solar:users-group-rounded-bold-duotone" />}>
              Gestionar Accesos
            </Button>
          )*/}
          {permissions?.canDelete && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              onClick={() => setDeleteModalOpen(true)}
            >
              Eliminar
            </Button>
          )}
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Documentos" />
          {permissions?.canGrantAccess && <Tab label="Accesos" />}
          {(permissions?.canGrantAccess || permissions?.canInvite) && <Tab label="Invitaciones" />}
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        {permissions && (
          <DocumentsTab
            projectId={id || ''}
            canEdit={permissions.canEdit}
            canDelete={permissions.canDelete}
          />
        )}
      </TabPanel>

      {permissions?.canGrantAccess && (
        <TabPanel value={tabValue} index={1}>
          <AccessTab
            projectId={id || ''}
            canInvite={permissions.canInvite}
            canGrantAccess={permissions.canGrantAccess}
          />
        </TabPanel>
      )}

      {(permissions?.canGrantAccess || permissions?.canInvite) && (
        <TabPanel value={tabValue} index={permissions?.canGrantAccess ? 2 : 1}>
          <InvitationsTab
            projectId={id || ''}
            canInvite={permissions.canInvite}
          />
        </TabPanel>
      )}

      {/* Change Status Modal */}
      {id && (
        <ChangeStatusModal
          open={changeStatusModalOpen}
          onClose={() => setChangeStatusModalOpen(false)}
          projectId={id}
          currentStatus={project.status}
          onStatusChanged={handleStatusChanged}
        />
      )}

      {/* Delete Project Modal */}
      {id && (
        <DeleteProjectModal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          projectId={id}
          projectName={project.name}
          onProjectDeleted={handleProjectDeleted}
        />
      )}

      {/* Edit Project Modal */}
      {id && (
        <CreateProjectModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onProjectCreated={handleProjectUpdated}
          project={project}
          isEditMode
        />
      )}

      {/* Chatbot Floating Bubble */}
      {!chatOpen && (
        <Fab
          color="primary"
          size="large"
          aria-label="Asistente de proyecto"
          onClick={() => setChatOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            width: 64,
            height: 64,
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 36 36">
            <g transform="translate(2, 1.25) scale(1)">
              <path fill="#F8312F" d="M5 3.5a1.5 1.5 0 0 1-1 1.415V12l2.16 5.487L4 23c-1.1 0-2-.9-2-1.998v-7.004a2 2 0 0 1 1-1.728V4.915A1.5 1.5 0 1 1 5 3.5m25.05.05c0 .681-.44 1.26-1.05 1.468V12.2c.597.347 1 .994 1 1.73v7.01c0 1.1-.9 2-2 2l-2.94-5.68L28 11.93V5.018a1.55 1.55 0 1 1 2.05-1.468" />
              <path fill="#FFB02E" d="M11 4.5A1.5 1.5 0 0 1 12.5 3h7a1.5 1.5 0 0 1 .43 2.938c-.277.082-.57.104-.847.186l-3.053.904l-3.12-.908c-.272-.08-.56-.1-.832-.18A1.5 1.5 0 0 1 11 4.5" />
              <path fill="#CDC4D6" d="M22.05 30H9.95C6.66 30 4 27.34 4 24.05V12.03C4 8.7 6.7 6 10.03 6h11.95C25.3 6 28 8.7 28 12.03v12.03c0 3.28-2.66 5.94-5.95 5.94" />
              <path fill="#212121" d="M9.247 18.5h13.506c2.33 0 4.247-1.919 4.247-4.25A4.257 4.257 0 0 0 22.753 10H9.247A4.257 4.257 0 0 0 5 14.25a4.257 4.257 0 0 0 4.247 4.25m4.225 7.5h5.056C19.34 26 20 25.326 20 24.5s-.66-1.5-1.472-1.5h-5.056C12.66 23 12 23.674 12 24.5s.66 1.5 1.472 1.5" />
              <path fill="#00A6ED" d="M10.25 12C9.56 12 9 12.56 9 13.25v2.5a1.25 1.25 0 1 0 2.5 0v-2.5c0-.69-.56-1.25-1.25-1.25m11.5 0c-.69 0-1.25.56-1.25 1.25v2.5a1.25 1.25 0 1 0 2.5 0v-2.5c0-.69-.56-1.25-1.25-1.25" />
            </g>
          </svg>
        </Fab>
      )}

      {/* Project Chat */}
      {id && (
        <ProjectChat
          projectId={id}
          projectName={project?.name || ''}
          open={chatOpen}
          onClose={() => setChatOpen(false)}
        />
      )}
    </Box>
  );
}
