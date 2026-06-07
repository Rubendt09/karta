import { Grid, Card, Box, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';

export function AddNewProjectCard() {
    return <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
      <Card
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
    </Grid>;
  }