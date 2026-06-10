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
} from '@mui/material';
import { adminService } from 'src/services/adminService';

export function AuditView() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getActivity();
      setLogs(data);
    } catch (err) {
      setError('Error al cargar logs de actividad. Por favor, intenta nuevamente.');
      console.error('Error loading logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'success';
      case 'UPDATE':
        return 'info';
      case 'DELETE':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredLogs = actionFilter === 'ALL' ? logs : logs.filter((l) => l.action === actionFilter);

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

      {/* Filter */}
      <Box sx={{ mb: 3 }}>
        <TextField
          select
          size="small"
          label="Filtrar por acción"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          sx={{ width: 200 }}
        >
          <MenuItem value="ALL">Todas las acciones</MenuItem>
          <MenuItem value="CREATE">Crear</MenuItem>
          <MenuItem value="UPDATE">Actualizar</MenuItem>
          <MenuItem value="DELETE">Eliminar</MenuItem>
        </TextField>
      </Box>

      {/* Logs Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Usuario</TableCell>
              <TableCell>Acción</TableCell>
              <TableCell>Entidad</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Fecha</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <Typography variant="body2">{log.userName}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={log.action}
                    size="small"
                    color={getActionColor(log.action) as any}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{log.entity}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{log.description}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(log.timestamp).toLocaleString('es-ES')}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
