import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { userService } from 'src/services/userService';
import type { RegisterInvitedRequest } from 'src/types/user';

export function RegisterInvitedView() {
  const [searchParams] = useSearchParams();
  const [invitationData, setInvitationData] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    temporaryPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // In a real implementation, you would fetch invitation data using a token from URL
    const token = searchParams.get('token');
    if (token) {
      // Mock invitation data - in real app, fetch from API
      setInvitationData({
        email: 'invitado@example.com',
        projectName: 'Proyecto Ejemplo',
        permissions: { canView: true, canEdit: false },
        temporaryPassword: 'TempPass123!',
      });
      setFormData((prev) => ({
        ...prev,
        email: 'invitado@example.com',
        temporaryPassword: 'TempPass123!',
      }));
    }
  }, [searchParams]);

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim() || formData.name.length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      return;
    }
    if (formData.newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data: RegisterInvitedRequest = {
        email: formData.email,
        name: formData.name,
        temporaryPassword: formData.temporaryPassword,
        newPassword: formData.newPassword,
      };
      await userService.registerInvited(data);
      setSuccess(true);
    } catch (err) {
      setError('Error al registrar. Por favor, intenta nuevamente.');
      console.error('Error registering invited user:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  const getStrengthColor = (strength: number) => {
    if (strength <= 2) return 'error';
    if (strength <= 3) return 'warning';
    if (strength <= 4) return 'info';
    return 'success';
  };

  const getStrengthLabel = (strength: number) => {
    if (strength <= 2) return 'Débil';
    if (strength <= 3) return 'Media';
    if (strength <= 4) return 'Fuerte';
    return 'Muy fuerte';
  };

  if (success) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Card sx={{ maxWidth: 500, width: '100%', mx: 2 }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'success.light',
                color: 'success.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <Iconify icon="solar:check-circle-bold" width={40} />
            </Box>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              ¡Registro Exitoso!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Tu cuenta ha sido creada exitosamente. Ahora puedes acceder al proyecto.
            </Typography>
            <Button variant="contained" href="/projects" fullWidth>
              Ir a Mis Proyectos
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ mb: 1, textAlign: 'center', fontWeight: 600 }}>
            Registro de Invitado
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
            Completa tu registro para aceptar la invitación
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {invitationData && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Información de la Invitación
              </Typography>
              <Typography variant="body2">Email: {invitationData.email}</Typography>
              <Typography variant="body2">Proyecto: {invitationData.projectName}</Typography>
            </Box>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email (read-only) */}
            <TextField
              fullWidth
              label="Email"
              value={formData.email}
              disabled
              sx={{ mb: 2 }}
            />

            {/* Name */}
            <TextField
              fullWidth
              label="Nombre Completo"
              value={formData.name}
              onChange={handleChange('name')}
              disabled={loading}
              sx={{ mb: 2 }}
            />

            {/* Temporary Password (read-only) */}
            <TextField
              fullWidth
              label="Contraseña Temporal"
              type={showPassword ? 'text' : 'password'}
              value={formData.temporaryPassword}
              disabled
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      <Iconify icon={showPassword ? 'solar:eye-closed-bold' : 'solar:eye-bold'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* New Password */}
            <TextField
              fullWidth
              label="Nueva Contraseña"
              type={showNewPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={handleChange('newPassword')}
              disabled={loading}
              sx={{ mb: 1 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                      <Iconify icon={showNewPassword ? 'solar:eye-closed-bold' : 'solar:eye-bold'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {formData.newPassword && (
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Fortaleza:
                </Typography>
                <Typography
                  variant="caption"
                  color={getStrengthColor(getPasswordStrength(formData.newPassword))}
                  sx={{ fontWeight: 600 }}
                >
                  {getStrengthLabel(getPasswordStrength(formData.newPassword))}
                </Typography>
              </Box>
            )}

            {/* Confirm Password */}
            <TextField
              fullWidth
              label="Confirmar Contraseña"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              disabled={loading}
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                      <Iconify icon={showConfirmPassword ? 'solar:eye-closed-bold' : 'solar:eye-bold'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button type="submit" variant="contained" fullWidth disabled={loading}>
                {loading ? <CircularProgress size={20} /> : 'Aceptar Invitación'}
              </Button>
              <Button variant="outlined" fullWidth disabled={loading}>
                Rechazar
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
