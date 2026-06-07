import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import Checkbox from '@mui/material/Checkbox';

import { useAuth } from 'src/context/AuthContext';

// ----------------------------------------------------------------------

export function SignInView() {
  const router = useRouter();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = useCallback(
    async (event?: React.FormEvent) => {
      event?.preventDefault();
      
      if (!email || !password) {
        setError('Por favor ingresa tu correo y contraseña');
        return;
      }

      setLoading(true);
      setError('');

      try {
        await login(email, password);
        router.push('/dashboard');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      } finally {
        setLoading(false);
      }
    },
    [router, login, email, password]
  );

  const renderForm = (
    <Box
      component="form"
      onSubmit={handleSignIn}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'column',
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        name="email"
        label="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 3 }}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <TextField
        fullWidth
        name="password"
        label="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type={showPassword ? 'text' : 'password'}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 2 }}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Checkbox />
        <Typography variant="body2">Mantener sesión iniciada</Typography>
      </Box>
    
      <Link variant="body2" color="primary" sx={{ mb: 3, alignSelf: 'flex-end' }}>
        <strong>Olvidaste tu contraseña?</strong>
      </Link>

      <Button
        fullWidth
        size="large"
        type="submit"
        color="primary"
        variant="contained"
        disabled={loading}
      >
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </Button>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          gap: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          mb: 5,
        }}
      >
        <Typography variant="h5">Iniciar sesión</Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          Sistema de gestión de documental
        </Typography>
      </Box>
      {renderForm}
    </>
  );
}
