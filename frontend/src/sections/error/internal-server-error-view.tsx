import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { Logo } from 'src/components/logo';

// ----------------------------------------------------------------------

export function InternalServerErrorView() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <>
      <Logo sx={{ position: 'fixed', top: 20, left: 20 }} />

      <Container
        sx={{
          py: 10,
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Iconify
          icon="solar:server-minimalistic-broken-bold"
          width={120}
          sx={{ color: 'error.main', mb: 4 }}
        />

        <Typography variant="h3" sx={{ mb: 2 }}>
          Error del Servidor
        </Typography>

        <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 480, textAlign: 'center', mb: 1 }}>
          Algo salió mal en nuestros servidores
        </Typography>

        <Typography sx={{ color: 'text.secondary', maxWidth: 480, textAlign: 'center', mb: 4 }}>
          Estamos trabajando para solucionar el problema. Por favor, intenta nuevamente en unos minutos.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button size="large" variant="contained" color="primary" onClick={handleRetry}>
            Reintentar
          </Button>

          <Button component={RouterLink} href="/" size="large" variant="outlined" color="inherit">
            Volver al Inicio
          </Button>
        </Box>
      </Container>
    </>
  );
}
