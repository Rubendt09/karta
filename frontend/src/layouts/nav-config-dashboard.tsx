import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';

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
    title: 'Usuarios invitados',
    path: '/user',
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