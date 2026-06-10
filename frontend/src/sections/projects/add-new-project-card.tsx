import { useState } from 'react';
import { Grid, Card, Box, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { CreateProjectModal } from './create-project-modal';

interface AddNewProjectCardProps {
  onProjectCreated?: () => void;
}

export function AddNewProjectCard({ onProjectCreated }: AddNewProjectCardProps) {
    const [modalOpen, setModalOpen] = useState(false);

    const handleOpenModal = () => {
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleProjectCreated = () => {
        handleCloseModal();
        if (onProjectCreated) {
            onProjectCreated();
        }
    };

    return (
        <>
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <Card
                    onClick={handleOpenModal}
                    sx={{
                        height: '100%',
                        border: 2,
                        borderColor: 'divider',
                        borderStyle: 'dashed',
                        bgcolor: 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 280,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: 'primary.lighter',
                        },
                    }}
                >
                    <Box sx={{ textAlign: 'center' }}>
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                bgcolor: 'grey.200',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 2,
                                mx: 'auto',
                            }}
                        >
                            <Iconify icon="solar:add-bold" width={24} />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                            Crear nuevo espacio de trabajo
                        </Typography>
                    </Box>
                </Card>
            </Grid>
            <CreateProjectModal
                open={modalOpen}
                onClose={handleCloseModal}
                onProjectCreated={handleProjectCreated}
            />
        </>
    );
}