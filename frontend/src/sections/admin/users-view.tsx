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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { userService } from 'src/services/userService';
import { Role, type UserResponse, type CreateUserRequest, type UpdateUserRequest } from 'src/types/user';

export function UsersView() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: Role.ASESOR,
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteUserEmail, setDeleteUserEmail] = useState('');
  const [userToDelete, setUserToDelete] = useState<UserResponse | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'deactivate' | 'reactivate'>('deactivate');

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
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    setUserToDelete(user);
    setDeleteUserEmail('');
    setDeleteError(null);
    setModalMode('deactivate');
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    if (deleteUserEmail !== userToDelete.email) {
      setDeleteError(modalMode === 'deactivate' ? 'El email no coincide con el usuario a desactivar' : 'El email no coincide con el usuario a reactivar');
      return;
    }

    try {
      setDeleteLoading(true);
      setDeleteError(null);

      if (modalMode === 'deactivate') {
        await userService.deactivateUser(userToDelete.id);
      } else {
        await userService.reactivateUser(userToDelete.id);
      }

      setDeleteModalOpen(false);
      setUserToDelete(null);
      setDeleteUserEmail('');
      loadUsers();
    } catch (err) {
      setDeleteError(modalMode === 'deactivate' ? 'Error al desactivar usuario. Por favor, intenta nuevamente.' : 'Error al reactivar usuario. Por favor, intenta nuevamente.');
      console.error(`Error ${modalMode}ing user:`, err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleReactivate = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    setUserToDelete(user);
    setDeleteUserEmail('');
    setDeleteError(null);
    setModalMode('reactivate');
    setDeleteModalOpen(true);
  };

  const handleEditUser = (user: UserResponse) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      password: '',
      role: user.role,
    });
    setCreateError(null);
    setCreateModalOpen(true);
  };

  const handleCreateUser = async () => {
    if (editingUser) {
      // Update existing user
      if (!formData.name || !formData.role) {
        setCreateError('Nombre y rol son requeridos');
        return;
      }

      try {
        setCreateLoading(true);
        setCreateError(null);

        const updateUserRequest: UpdateUserRequest = {
          name: formData.name,
          role: formData.role,
        };

        await userService.updateUser(editingUser.id, updateUserRequest);
        setCreateModalOpen(false);
        setEditingUser(null);
        setFormData({ email: '', name: '', password: '', role: Role.ASESOR });
        loadUsers();
      } catch (err) {
        setCreateError('Error al actualizar usuario. Por favor, intenta nuevamente.');
        console.error('Error updating user:', err);
      } finally {
        setCreateLoading(false);
      }
    } else {
      // Create new user
      if (!formData.email || !formData.name || !formData.password || !formData.role) {
        setCreateError('Todos los campos son requeridos');
        return;
      }

      try {
        setCreateLoading(true);
        setCreateError(null);

        const createUserRequest: CreateUserRequest = {
          email: formData.email,
          name: formData.name,
          password: formData.password,
          role: formData.role,
        };

        await userService.createUser(createUserRequest);
        setCreateModalOpen(false);
        setFormData({ email: '', name: '', password: '', role: Role.ASESOR });
        loadUsers();
      } catch (err) {
        setCreateError('Error al crear usuario. Por favor, intenta nuevamente.');
        console.error('Error creating user:', err);
      } finally {
        setCreateLoading(false);
      }
    }
  };

  const handleCloseModal = () => {
    setCreateModalOpen(false);
    setEditingUser(null);
    setFormData({ email: '', name: '', password: '', role: Role.ASESOR });
    setCreateError(null);
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
          onClick={() => setCreateModalOpen(true)}
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
                  <IconButton size="small" onClick={() => handleEditUser(user)}>
                    <Iconify icon="solar:pen-bold" />
                  </IconButton>
                  {user.active ? (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeactivate(user.id)}
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  ) : (
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() => handleReactivate(user.id)}
                    >
                      <Iconify icon="solar:restart-bold" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit User Modal */}
      <Dialog open={createModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            {createError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {createError}
              </Alert>
            )}
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={createLoading || !!editingUser}
              helperText={editingUser ? 'El email no se puede modificar' : ''}
            />
            <TextField
              label="Nombre Completo"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={createLoading}
            />
            {!editingUser && (
              <TextField
                label="Contraseña"
                type="password"
                fullWidth
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={createLoading}
              />
            )}
            <TextField
              select
              label="Rol"
              fullWidth
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
              disabled={createLoading}
            >
              <MenuItem value={Role.ADMIN}>Administrador</MenuItem>
              <MenuItem value={Role.ASESOR}>Asesor</MenuItem>
              <MenuItem value={Role.INVITADO}>Invitado</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} disabled={createLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateUser}
            variant="contained"
            disabled={createLoading}
            startIcon={createLoading ? <CircularProgress size={20} /> : <Iconify icon="solar:add-bold" />}
          >
            {createLoading ? (editingUser ? 'Actualizando...' : 'Creando...') : (editingUser ? 'Actualizar Usuario' : 'Crear Usuario')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete/Reactivate Confirmation Modal */}
      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{modalMode === 'deactivate' ? 'Desactivar Usuario' : 'Reactivar Usuario'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Alert severity={modalMode === 'deactivate' ? 'warning' : 'info'} sx={{ mb: 2 }}>
              {modalMode === 'deactivate'
                ? 'Esta acción desactivará el usuario. Para confirmar, por favor ingresa el email del usuario.'
                : 'Esta acción reactivará el usuario. Para confirmar, por favor ingresa el email del usuario.'}
            </Alert>
            {deleteError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {deleteError}
              </Alert>
            )}
            <Typography variant="body2" sx={{ mb: 1 }}>
              Usuario a {modalMode === 'deactivate' ? 'desactivar' : 'reactivar'}: <strong>{userToDelete?.name}</strong> ({userToDelete?.email})
            </Typography>
            <TextField
              label="Confirma con el email del usuario"
              type="email"
              fullWidth
              value={deleteUserEmail}
              onChange={(e) => setDeleteUserEmail(e.target.value)}
              disabled={deleteLoading}
              placeholder={userToDelete?.email}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)} disabled={deleteLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color={modalMode === 'deactivate' ? 'error' : 'success'}
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : (modalMode === 'deactivate' ? <Iconify icon="solar:trash-bin-trash-bold" /> : <Iconify icon="solar:restart-bold" />)}
          >
            {deleteLoading ? (modalMode === 'deactivate' ? 'Desactivando...' : 'Reactivando...') : (modalMode === 'deactivate' ? 'Desactivar Usuario' : 'Reactivar Usuario')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
