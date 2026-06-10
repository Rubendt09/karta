import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { DashboardContent } from 'src/layouts/dashboard';
import { ProjectCard } from '../project-card';
import { ToolbarProject } from '../toolbarbar-project';
import { CreateProjectModal } from '../create-project-modal';
import { projectService } from 'src/services/projectService';
import type { ProjectResponse, ProjectStatus } from 'src/types/project';

export function ProjectsView() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err) {
      setError('Error al cargar proyectos. Por favor, intenta nuevamente.');
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesStatus = filterStatus === 'ALL' || project.status === filterStatus;
    const matchesSearch =
      searchQuery === '' ||
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleStatusFilter = (status: ProjectStatus | 'ALL') => {
    setFilterStatus(status);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleViewDetail = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
  };

  const handleProjectCreated = () => {
    handleCloseCreateModal();
    loadProjects();
  };

  if (loading) {
    return (
      <DashboardContent maxWidth="xl">
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
      </DashboardContent>
    );
  }

  if (error) {
    return (
      <DashboardContent maxWidth="xl">
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Mis Proyectos
      </Typography>

      {/* Toolbar */}
      <ToolbarProject
        onStatusFilter={handleStatusFilter}
        onSearch={handleSearch}
        currentStatus={filterStatus}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onCreateProject={handleOpenCreateModal}
      />

      {/* Projects Grid */}
      <Grid container spacing={3}>
        {filteredProjects.map((project) => (
          viewMode === 'grid' ? (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={project.id}>
              <ProjectCard
                id={project.id}
                title={project.name}
                description={project.description}
                status={project.status}
                role={project.ownerId === 'current-user-id' ? 'owner' : 'guest'} // TODO: Get current user ID from auth
                documents={project.documentCount || 0}
                updatedAt={new Date(project.updatedAt).toLocaleDateString('es-ES')}
                onViewDetail={() => handleViewDetail(project.id)}
              />
            </Grid>
          ) : (
            <Grid size={12} key={project.id}>
              <ProjectCard
                id={project.id}
                title={project.name}
                description={project.description}
                status={project.status}
                role={project.ownerId === 'current-user-id' ? 'owner' : 'guest'} // TODO: Get current user ID from auth
                documents={project.documentCount || 0}
                updatedAt={new Date(project.updatedAt).toLocaleDateString('es-ES')}
                onViewDetail={() => handleViewDetail(project.id)}
              />
            </Grid>
          )
        ))}

      </Grid>

      {filteredProjects.length === 0 && !loading && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px',
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            No tienes proyectos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Crea tu primer proyecto para empezar
          </Typography>
        </Box>
      )}
      
      <CreateProjectModal
        open={createModalOpen}
        onClose={handleCloseCreateModal}
        onProjectCreated={handleProjectCreated}
      />
    </DashboardContent>
  );
}
