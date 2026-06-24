import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Button,
  Grid,
} from '@mui/material';
import { adminService } from 'src/services/adminService';
import { userService } from 'src/services/userService';
import type { ActivityLog } from 'src/services/adminService';
import type { UserResponse } from 'src/types/user';

const MODULES = [
  { value: '', label: 'Todos los módulos' },
  { value: 'PROJECT', label: 'Proyecto' },
  { value: 'DOCUMENT', label: 'Documento' },
  { value: 'PERMISSION', label: 'Permiso' },
  { value: 'INVITATION', label: 'Invitación' },
  { value: 'USER', label: 'Usuario' },
];

const ACTIONS = [
  { value: '', label: 'Todas las acciones' },
  { value: 'CREATE', label: 'Crear' },
  { value: 'UPDATE', label: 'Actualizar' },
  { value: 'DELETE', label: 'Eliminar' },
  { value: 'STATUS_CHANGE', label: 'Cambiar estado' },
  { value: 'GRANT', label: 'Otorgar' },
  { value: 'REVOKE', label: 'Revocar' },
  { value: 'INVITE', label: 'Invitar' },
  { value: 'ACCEPT', label: 'Aceptar' },
  { value: 'REJECT', label: 'Rechazar' },
];

export function AuditView() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [module, setModule] = useState<string>('');
  const [action, setAction] = useState<string>('');

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: Record<string, string> = {};
      if (startDate) filters.startDate = `${startDate}T00:00:00`;
      if (endDate) filters.endDate = `${endDate}T23:59:59`;
      if (userId) filters.userId = userId;
      if (module) filters.module = module;
      if (action) filters.action = action;

      const data = await adminService.getActivity(filters);
      setLogs(data);
    } catch (err) {
      setError('Error al cargar logs de actividad. Por favor, intenta nuevamente.');
      console.error('Error loading logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  useEffect(() => {
    loadUsers();
    loadLogs();
  }, []);

  const handleApplyFilters = () => {
    loadLogs();
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setUserId('');
    setModule('');
    setAction('');
    setTimeout(loadLogs, 0);
  };

  const getActionColor = (actionName: string) => {
    switch (actionName) {
      case 'CREATE':
      case 'GRANT':
      case 'ACCEPT':
        return 'success';
      case 'UPDATE':
      case 'STATUS_CHANGE':
        return 'info';
      case 'DELETE':
      case 'REVOKE':
      case 'REJECT':
        return 'error';
      case 'INVITE':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getModuleLabel = (moduleName: string) => {
    const found = MODULES.find((m) => m.value === moduleName);
    return found ? found.label : moduleName;
  };

  const getActionLabel = (actionName: string) => {
    const found = ACTIONS.find((a) => a.value === actionName);
    return found ? found.label : actionName;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Auditoría de Actividad
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            type="date"
            label="Desde"
            size="small"
            fullWidth
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            type="date"
            label="Hasta"
            size="small"
            fullWidth
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            select
            label="Usuario"
            size="small"
            fullWidth
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          >
            <MenuItem value="">Todos los usuarios</MenuItem>
            {users.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.name} ({u.email})
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            select
            label="Módulo"
            size="small"
            fullWidth
            value={module}
            onChange={(e) => setModule(e.target.value)}
          >
            {MODULES.map((m) => (
              <MenuItem key={m.value} value={m.value}>
                {m.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            select
            label="Acción"
            size="small"
            fullWidth
            value={action}
            onChange={(e) => setAction(e.target.value)}
          >
            {ACTIONS.map((a) => (
              <MenuItem key={a.value} value={a.value}>
                {a.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, height: '100%', alignItems: 'flex-start' }}>
            <Button variant="contained" size="small" onClick={handleApplyFilters}>
              Filtrar
            </Button>
            <Button variant="outlined" size="small" onClick={handleClearFilters}>
              Limpiar
            </Button>
          </Box>
        </Grid>
      </Grid>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Módulo</TableCell>
              <TableCell>Acción</TableCell>
              <TableCell>Descripción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(log.timestamp).toLocaleString('es-ES')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{log.userEmail}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{getModuleLabel(log.module)}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getActionLabel(log.action)}
                    size="small"
                    color={getActionColor(log.action) as any}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{log.description}</Typography>
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No hay registros de actividad
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
