import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { userService } from 'src/services/userService';
import { Role, type UserResponse } from 'src/types/user';

export function UsersView() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      setError('Error al cargar usuarios. Por favor, intenta nuevamente.');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDeactivate = async (userId: string) => {
    if (!confirm('¿Estás seguro de que deseas desactivar este usuario?')) {
      return;
    }

    try {
      await userService.deactivateUser(userId);
      loadUsers();
    } catch (err) {
      console.error('Error deactivating user:', err);
    }
  };

  const getRoleColor = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return 'error';
      case Role.ASESOR:
        return 'primary';
      case Role.INVITADO:
        return 'default';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return 'Administrador';
      case Role.ASESOR:
        return 'Asesor';
      case Role.INVITADO:
        return 'Invitado';
      default:
        return role;
    }
  };

  const filteredUsers = roleFilter === 'ALL' ? users : users.filter((u) => u.role === roleFilter);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Gestión de Usuarios ({users.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="solar:add-bold" />}
        >
          Crear Usuario
        </Button>
      </Box>

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
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          sx={{ width: 200 }}
        >
          <MenuItem value="ALL">Todos los roles</MenuItem>
          <MenuItem value={Role.ADMIN}>Administradores</MenuItem>
          <MenuItem value={Role.ASESOR}>Asesores</MenuItem>
          <MenuItem value={Role.INVITADO}>Invitados</MenuItem>
        </TextField>
      </Box>

      {/* Users Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha de Registro</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {user.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{user.email}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getRoleLabel(user.role)}
                    size="small"
                    color={getRoleColor(user.role) as any}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.active ? 'Activo' : 'Inactivo'}
                    size="small"
                    color={user.active ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(user.createdAt).toLocaleDateString('es-ES')}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small">
                    <Iconify icon="solar:pen-bold" />
                  </IconButton>
                  {user.active && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeactivate(user.id)}
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
