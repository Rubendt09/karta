import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import Checkbox from '@mui/material/Checkbox';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';

import { useAuth } from 'src/context/AuthContext';
import { authService } from 'src/services/authService';

// ----------------------------------------------------------------------

type AuthViewStep = 'sign-in' | 'request-code' | 'verify-code' | 'reset-password';

export function SignInView() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = useState<AuthViewStep>('sign-in');

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOpenRecovery = useCallback(() => {
    setError('');
    setSuccessMessage('');
    setRecoveryEmail(email);
    setRecoveryCode('');
    setNewPassword('');
    setConfirmPassword('');
    setStep('request-code');
  }, [email]);

  const handleBackToSignIn = useCallback(() => {
    setError('');
    setSuccessMessage('');
    setStep('sign-in');
  }, []);

  const handleSignIn = useCallback(
    async (event?: React.FormEvent) => {
      event?.preventDefault();

      if (!email || !password) {
        setError('Por favor ingresa tu correo y contraseña');
        return;
      }

      setLoading(true);
      setError('');
      setSuccessMessage('');

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

  const handleRequestCode = useCallback(
    async (event?: React.FormEvent) => {
      event?.preventDefault();

      if (!recoveryEmail.trim()) {
        setError('Por favor ingresa tu correo electrónico');
        return;
      }

      setLoading(true);
      setError('');
      setSuccessMessage('');

      try {
        await authService.forgotPassword(recoveryEmail.trim());
        setSuccessMessage(
          'Código generado. Revisa los logs en la consola de Docker para obtener tu código de recuperación.'
        );
        setStep('verify-code');
      } catch (err: any) {
        setError(
          err.response?.data?.message || 'No se pudo generar el código de recuperación. Verifica el correo ingresado.'
        );
      } finally {
        setLoading(false);
      }
    },
    [recoveryEmail]
  );

  const handleVerifyCode = useCallback(
    async (event?: React.FormEvent) => {
      event?.preventDefault();

      if (!recoveryCode.trim()) {
        setError('Por favor ingresa el código de recuperación');
        return;
      }

      setLoading(true);
      setError('');
      setSuccessMessage('');

      try {
        await authService.verifyResetCode(recoveryEmail.trim(), recoveryCode.trim().toUpperCase());
        setSuccessMessage('Código verificado. Ingresa tu nueva contraseña.');
        setStep('reset-password');
      } catch (err: any) {
        setError(err.response?.data?.message || 'El código ingresado es inválido o ha expirado.');
      } finally {
        setLoading(false);
      }
    },
    [recoveryEmail, recoveryCode]
  );

  const handleResetPassword = useCallback(
    async (event?: React.FormEvent) => {
      event?.preventDefault();

      if (!newPassword || !confirmPassword) {
        setError('Por favor completa ambos campos de contraseña');
        return;
      }

      if (newPassword.length < 6) {
        setError('La nueva contraseña debe tener al menos 6 caracteres');
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }

      setLoading(true);
      setError('');
      setSuccessMessage('');

      try {
        await authService.resetPassword({
          email: recoveryEmail.trim(),
          code: recoveryCode.trim().toUpperCase(),
          newPassword,
          confirmPassword,
        });
        setEmail(recoveryEmail.trim());
        setPassword('');
        setSuccessMessage('Contraseña restablecida correctamente. Ahora puedes iniciar sesión.');
        setStep('sign-in');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al restablecer la contraseña.');
      } finally {
        setLoading(false);
      }
    },
    [recoveryEmail, recoveryCode, newPassword, confirmPassword]
  );

  const renderSignInForm = (
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

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3, width: '100%' }}>
          {successMessage}
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

      <Link
        component="button"
        type="button"
        variant="body2"
        color="primary"
        onClick={handleOpenRecovery}
        sx={{ mb: 3, alignSelf: 'flex-end', cursor: 'pointer' }}
      >
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

  const renderRequestCodeForm = (
    <Box
      component="form"
      onSubmit={handleRequestCode}
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
        name="recoveryEmail"
        type="email"
        label="Correo electrónico"
        placeholder="ejemplo@correo.com"
        value={recoveryEmail}
        onChange={(e) => setRecoveryEmail(e.target.value)}
        sx={{ mb: 3 }}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <Button
        fullWidth
        size="large"
        type="submit"
        color="primary"
        variant="contained"
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? 'Generando código...' : 'Generar código de recuperación'}
      </Button>

      <Button
        fullWidth
        size="large"
        color="inherit"
        variant="outlined"
        onClick={handleBackToSignIn}
        disabled={loading}
      >
        Volver al inicio de sesión
      </Button>
    </Box>
  );

  const renderVerifyCodeForm = (
    <Box
      component="form"
      onSubmit={handleVerifyCode}
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

      {successMessage && (
        <Alert severity="info" sx={{ mb: 3, width: '100%' }}>
          {successMessage}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Correo electrónico"
        value={recoveryEmail}
        disabled
        sx={{ mb: 2 }}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <TextField
        fullWidth
        name="recoveryCode"
        label="Código de recuperación"
        placeholder="Ej: A1B2C3"
        value={recoveryCode}
        onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
        sx={{ mb: 3 }}
        slotProps={{
          inputLabel: { shrink: true },
          htmlInput: { maxLength: 6, style: { letterSpacing: '0.25em', fontWeight: 600 } },
        }}
      />

      <Button
        fullWidth
        size="large"
        type="submit"
        color="primary"
        variant="contained"
        disabled={loading}
        sx={{ mb: 1.5 }}
      >
        {loading ? 'Verificando...' : 'Verificar código'}
      </Button>

      <Button
        fullWidth
        size="medium"
        color="primary"
        variant="text"
        onClick={() => handleRequestCode()}
        disabled={loading}
        sx={{ mb: 1.5 }}
      >
        Generar un nuevo código
      </Button>

      <Button
        fullWidth
        size="large"
        color="inherit"
        variant="outlined"
        onClick={handleBackToSignIn}
        disabled={loading}
      >
        Volver al inicio de sesión
      </Button>
    </Box>
  );

  const renderResetPasswordForm = (
    <Box
      component="form"
      onSubmit={handleResetPassword}
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

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3, width: '100%' }}>
          {successMessage}
        </Alert>
      )}

      <TextField
        fullWidth
        name="newPassword"
        label="Nueva contraseña"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        type={showNewPassword ? 'text' : 'password'}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                  <Iconify icon={showNewPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 3 }}
      />

      <TextField
        fullWidth
        name="confirmPassword"
        label="Confirmar nueva contraseña"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        type={showConfirmPassword ? 'text' : 'password'}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                  <Iconify icon={showConfirmPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 3 }}
      />

      <Button
        fullWidth
        size="large"
        type="submit"
        color="primary"
        variant="contained"
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
      </Button>

      <Button
        fullWidth
        size="large"
        color="inherit"
        variant="outlined"
        onClick={handleBackToSignIn}
        disabled={loading}
      >
        Cancelar
      </Button>
    </Box>
  );

  const getHeaderTitle = () => {
    switch (step) {
      case 'request-code':
        return 'Recuperar contraseña';
      case 'verify-code':
        return 'Verificar código';
      case 'reset-password':
        return 'Nueva contraseña';
      default:
        return 'Iniciar sesión';
    }
  };

  const getHeaderSubtitle = () => {
    switch (step) {
      case 'request-code':
        return 'Ingresa tu correo para generar un código aleatorio en la consola del servidor';
      case 'verify-code':
        return 'Ingresa el código de 6 caracteres mostrado en la consola de Docker';
      case 'reset-password':
        return 'Establece una nueva contraseña para tu cuenta';
      default:
        return 'Sistema de gestión de documental';
    }
  };

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
        <Box
          component="img"
          src="/assets/images/app-name-logo.png"
          alt="Karta"
          sx={{ width: 'auto', height: 120, mb: 1, alignSelf: 'center' }}
        />
        <Typography variant="h5">{getHeaderTitle()}</Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          {getHeaderSubtitle()}
        </Typography>
      </Box>
      {step === 'sign-in' && renderSignInForm}
      {step === 'request-code' && renderRequestCodeForm}
      {step === 'verify-code' && renderVerifyCodeForm}
      {step === 'reset-password' && renderResetPasswordForm}
    </>
  );
}
