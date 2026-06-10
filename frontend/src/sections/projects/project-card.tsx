import { Grid, Card, CardContent, Box, IconButton, Chip, Typography, Divider, Button } from "@mui/material";
import { Iconify } from "src/components/iconify";
import type { ProjectStatus } from "src/types/project";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  role: string;
  documents: number;
  updatedAt: string;
  onDelete?: () => void;
}

export function ProjectCard({ id, title, description, status, role, documents, updatedAt, onDelete }: ProjectCardProps) {

    const statusConfig = {
        ACTIVO: {
            label: 'Activo',
            color: 'success',
            bgColor: 'success',
        },
        DESPRIORIZADO: {
            label: 'Despriorizado',
            color: 'warning',
            bgColor: 'warning',
        },
        ARCHIVADO: {
            label: 'Archivado',
            color: 'default',
            bgColor: 'default',
        },
    };

    const roleConfig = {
        owner: {
            label: 'Propietario',
            color: 'primary',
        },
        guest: {
            label: 'Invitado',
            color: 'default',
        },
    };

    const getStatusColor = () => {
        const config = statusConfig[status as keyof typeof statusConfig];
        return config ? config.color : 'default';
    };

    const getRoleColor = () => {
        const config = roleConfig[role as keyof typeof roleConfig];
        return config ? config.color : 'default';
    };


    return <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={id}>
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
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: `${getStatusColor()}.lighter`,
                            color: `${getStatusColor()}.main`,
                        }}
                    >
                        <Iconify icon="solar:folder-favourite-bookmark-bold" width={32} />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                        <IconButton size="small">
                            <Iconify icon="eva:more-vertical-fill" />
                        </IconButton>
                        <Chip
                            label={statusConfig[status as keyof typeof statusConfig]?.label}
                            size="small"
                            color={getStatusColor() as any}
                            sx={{
                                fontSize: 11,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                            }} />
                    </Box>
                </Box>

                {/* Title and Description */}
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    {title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {description}
                </Typography>

                {/* Role Tag */}
                <Box sx={{ mb: 2 }}>
                    <Chip
                        label={roleConfig[role as keyof typeof roleConfig]?.label}
                        size="small"
                        color={getRoleColor() as any}
                        variant="outlined" />
                </Box>

                {/* Footer */}
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 3, color: 'text.secondary' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Iconify icon="solar:file-bold-duotone" width={18} />
                            <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                {documents}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Iconify icon="solar:clock-circle-outline" width={18} />
                            <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                {updatedAt}
                            </Typography>
                        </Box>
                    </Box>
                    <Button size="small" sx={{ fontWeight: 700 }}>
                        Ver Detalle
                    </Button>
                </Box>
            </CardContent>
        </Card>
    </Grid>;
}