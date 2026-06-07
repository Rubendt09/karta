import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import Box from '@mui/material/Box';

import { varAlpha } from 'src/utils/styles';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { AuthGuard } from 'src/components/auth-guard';
import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

export const DashboardPage = lazy(() => import('src/pages/dashboard'));
export const UserPage = lazy(() => import('src/pages/user'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const ProjectsPage = lazy(() => import('src/pages/projects'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));

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
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'user', element: <UserPage /> },
      { path: 'products', element: <ProductsPage /> },
    ],
  },
  {
    path: '404',
    element: <Page404 />,
  },
  { path: '*', element: <Page404 /> },
];
