import { Box, Button, Grid, IconButton, InputAdornment, MenuItem, Select, TextField } from "@mui/material";
import { useState } from "react";
import { Iconify } from "src/components/iconify";

export function ToolbarProject() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    return <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {/* Search */}
                <TextField
                    fullWidth
                    placeholder="Buscar proyectos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ minWidth: 160 }}
                >
                    <MenuItem value="all">Todos los Estados</MenuItem>
                    <MenuItem value="active">Activos</MenuItem>
                    <MenuItem value="deprioritized">Despriorizados</MenuItem>
                    <MenuItem value="archived">Archivados</MenuItem>
                </Select>
            </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                {/* View Mode Toggle */}
                <Box sx={{ display: 'flex', border: 1, borderColor: 'divider', borderRadius: 1, p: 0.5 }}>
                    <IconButton
                        size="small"
                        onClick={() => setViewMode('grid')}
                        sx={{
                            bgcolor: viewMode === 'grid' ? 'primary.lighter' : 'transparent',
                            color: viewMode === 'grid' ? 'primary.main' : 'text.secondary',
                        }}
                    >
                        <Iconify icon="solar:database-bold" />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={() => setViewMode('list')}
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
                >
                    Crear Proyecto
                </Button>
            </Box>
        </Grid>
    </Grid>;
}