import { Box, Checkbox, Typography, FormControlLabel, Grid } from '@mui/material';
import { Iconify } from 'src/components/iconify';

interface PermissionCheckboxProps {
  permissions: {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canDeprioritize: boolean;
    canInvite: boolean;
  };
  onChange: (permission: keyof PermissionCheckboxProps['permissions'], value: boolean) => void;
  disabled?: boolean;
}

const PERMISSION_CONFIG = {
  canView: {
    label: 'VER',
    description: 'Puede ver y descargar documentos',
    icon: 'solar:eye-bold',
  },
  canEdit: {
    label: 'EDITAR',
    description: 'Puede subir y editar documentos',
    icon: 'solar:pen-bold',
  },
  canDelete: {
    label: 'ELIMINAR',
    description: 'Puede eliminar documentos',
    icon: 'solar:trash-bin-trash-bold',
  },
  canDeprioritize: {
    label: 'DESPRIORIZAR',
    description: 'Puede cambiar estado de prioridad',
    icon: 'solar:restart-bold',
  },
  canInvite: {
    label: 'INVITAR',
    description: 'Puede invitar otros usuarios',
    icon: 'solar:users-group-rounded-bold-duotone',
  },
} as const;

export function PermissionCheckbox({
  permissions,
  onChange,
  disabled = false,
}: PermissionCheckboxProps) {
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
        Permisos a Otorgar
      </Typography>
      <Grid container spacing={2}>
        {(Object.keys(PERMISSION_CONFIG) as Array<keyof typeof PERMISSION_CONFIG>).map(
          (key) => {
            const config = PERMISSION_CONFIG[key];
            return (
              <Grid size={{ xs: 12, sm: 6 }} key={key}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={permissions[key]}
                      onChange={(e) => onChange(key, e.target.checked)}
                      disabled={disabled || key === 'canView'} // canView is always required
                      sx={{
                        '&.Mui-checked': {
                          color: 'primary.main',
                        },
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {config.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {config.description}
                      </Typography>
                    </Box>
                  }
                />
              </Grid>
            );
          }
        )}
      </Grid>
    </Box>
  );
}
