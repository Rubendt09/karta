import { useMemo } from 'react';

import { SvgColor } from 'src/components/svg-color';
import { useAuth } from 'src/context/AuthContext';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
  roles?: string[];
};

const allNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/',
    icon: icon('solar--widget-5-linear'),
    roles: ['ADMIN'],
  },
  {
    title: 'Mis proyectos',
    path: '/projects',
    icon: icon('solar--folder-with-files-outline'),
  },
  {
    title: 'Mis invitaciones',
    path: '/invitations',
    icon: icon('solar--users-group-two-rounded-linear'),
  },
  {
    title: 'Gestión de Usuarios',
    path: '/users',
    icon: icon('solar--users-group-two-rounded-linear'),
    roles: ['ADMIN'],
  },
  {
    title: 'Auditoría de actividad',
    path: '/audit',
    icon: icon('solar--users-group-two-rounded-linear'),
    roles: ['ADMIN'],
  },
];

export const useNavData = (): NavItem[] => {
  const { user } = useAuth();
  const userRole = user?.role;

  return useMemo(
    () =>
      allNavItems.filter((item) => {
        if (!item.roles || item.roles.length === 0) {
          return true;
        }
        return Boolean(userRole && item.roles.includes(userRole));
      }),
    [userRole]
  );
};