import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';
import { InvitationsPage } from 'src/routes/sections';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const navData = [
  {
    title: 'Dashboard',
    path: '/',
    icon: icon('solar--widget-5-linear'),
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
  },
  {
    title: 'Auditoría de actividad',
    path: '/audit',
    icon: icon('solar--users-group-two-rounded-linear'),
  },
];

{
  /**
    title: 'Sign in',
    path: '/sign-in',
    icon: icon('ic-lock'),
  },
  {
    title: 'Not found',
    path: '/404',
    icon: icon('ic-disabled'),
   */
}