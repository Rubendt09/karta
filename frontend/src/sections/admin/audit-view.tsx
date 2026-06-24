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
} from '@mui/material';
import { adminService } from 'src/services/adminService';
import type { UserActivity } from 'src/services/adminService';

export function AuditView() {
  const [logs, setLogs] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const getActivityColor = (actionCount: number) => {
    if (actionCount === 0) return 'default';
    if (actionCount < 10) return 'warning';
    return 'success';
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

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Usuario</TableCell>
              <TableCell align="right">Acciones</TableCell>
              <TableCell>Última actividad</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.userId}>
                <TableCell>
                  <Typography variant="body2">{log.email}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Chip
                    label={log.actionCount}
                    size="small"
                    color={getActivityColor(log.actionCount) as any}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {log.lastActivity
                      ? new Date(log.lastActivity).toLocaleString('es-ES')
                      : 'Sin actividad'}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>
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
