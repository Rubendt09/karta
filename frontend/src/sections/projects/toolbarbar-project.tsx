import { Box, Button, Grid, IconButton, InputAdornment, MenuItem, Select, TextField } from "@mui/material";
import { useState } from "react";
import { Iconify } from "src/components/iconify";
import type { ProjectStatus } from "src/types/project";

interface ToolbarProjectProps {
  onStatusFilter: (status: ProjectStatus | 'ALL') => void;
  onSearch: (query: string) => void;
  currentStatus: ProjectStatus | 'ALL';
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onCreateProject: () => void;
}

export function ToolbarProject({ onStatusFilter, onSearch, currentStatus, viewMode, onViewModeChange, onCreateProject }: ToolbarProjectProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        onSearch(value);
    };

    const handleStatusChange = (e: any) => {
        const value = e.target.value;
        onStatusFilter(value);
    };

    return <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {/* Search */}
                <TextField
                    fullWidth
                    placeholder="Buscar proyectos..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Iconify icon="eva:search-fill" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ maxWidth: 400, flex: 1 }} />

                {/* Status Filter */}
                <Select
                    value={currentStatus}
                    onChange={handleStatusChange}
                    sx={{ minWidth: 160 }}
                >
                    <MenuItem value="ALL">Todos los Estados</MenuItem>
                    <MenuItem value="ACTIVO">Activos</MenuItem>
                    <MenuItem value="DESPRIORIZADO">Despriorizados</MenuItem>
                    <MenuItem value="ARCHIVADO">Archivados</MenuItem>
                </Select>
            </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                {/* View Mode Toggle */}
                <Box sx={{ display: 'flex', border: 1, borderColor: 'divider', borderRadius: 1, p: 0.5 }}>
                    <IconButton
                        size="small"
                        onClick={() => onViewModeChange('grid')}
                        sx={{
                            bgcolor: viewMode === 'grid' ? 'primary.lighter' : 'transparent',
                            color: viewMode === 'grid' ? 'primary.main' : 'text.secondary',
                        }}
                    >
                        <Iconify icon="solar:database-bold" />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={() => onViewModeChange('list')}
                        sx={{
                            bgcolor: viewMode === 'list' ? 'primary.lighter' : 'transparent',
                            color: viewMode === 'list' ? 'primary.main' : 'text.secondary',
                        }}
                    >
                        <Iconify icon="solar:file-bold-duotone" />
                    </IconButton>
                </Box>

                {/* Create Project Button */}
                <Button
                    variant="contained"
                    startIcon={<Iconify icon="solar:add-bold" />}
                    sx={{ whiteSpace: 'nowrap' }}
                    onClick={onCreateProject}
                >
                    Crear Proyecto
                </Button>
            </Box>
        </Grid>
    </Grid>;
}