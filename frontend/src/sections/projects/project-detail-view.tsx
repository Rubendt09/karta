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
    </Box>
  );
}
