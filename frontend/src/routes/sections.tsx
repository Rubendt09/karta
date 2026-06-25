import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import Box from '@mui/material/Box';

import { varAlpha } from 'src/utils/styles';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { AuthGuard } from 'src/components/auth-guard';
import { RoleGuard } from 'src/components/role-guard';
import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

export const DashboardPage = lazy(() => import('src/pages/dashboard'));
export const UsersPage = lazy(() => import('src/pages/users'));
export const AuditPage = lazy(() => import('src/pages/audit'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const RegisterInvitedPage = lazy(() => import('src/pages/register-invited'));
export const ProjectsPage = lazy(() => import('src/pages/projects'));
export const ProjectDetailPage = lazy(() => import('src/pages/project-detail'));
export const InvitationsPage = lazy(() => import('src/pages/invitations'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));
export const Page500 = lazy(() => import('src/pages/internal-server-error'));

const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export const routesSection: RouteObject[] = [
  {
    index: true,
    element: (
      <AuthGuard redirectIfAuthenticated>
        <AuthLayout>
          <SignInPage />
        </AuthLayout>
      </AuthGuard>
    ),
  },
  {
    path: 'sign-in',
    element: (
      <AuthGuard redirectIfAuthenticated>
        <AuthLayout>
          <SignInPage />
        </AuthLayout>
      </AuthGuard>
    ),
  },
  {
    path: 'register-invited',
    element: (
      <AuthGuard redirectIfAuthenticated>
        <AuthLayout>
          <RegisterInvitedPage />
        </AuthLayout>
      </AuthGuard>
    ),
  },
  {
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={renderFallback()}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      { path: 'dashboard', element: (
        <RoleGuard allowedRoles={['ADMIN']}>
          <DashboardPage />
        </RoleGuard>
      ) },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'projects/:id', element: <ProjectDetailPage /> },
      { path: 'invitations', element: <InvitationsPage /> },
      { path: 'users', element: (
        <RoleGuard allowedRoles={['ADMIN']}>
          <UsersPage />
        </RoleGuard>
      ) },
      { path: 'audit', element: (
        <RoleGuard allowedRoles={['ADMIN']}>
          <AuditPage />
        </RoleGuard>
      ) },
    ],
  },
  {
    path: '404',
    element: <Page404 />,
  },
  {
    path: '500',
    element: <Page500 />,
  },
  { path: '*', element: <Page404 /> },
];
