import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from 'src/context/AuthContext';

// ----------------------------------------------------------------------

type AuthGuardProps = {
  children: React.ReactNode;
  redirectIfAuthenticated?: boolean;
};

export function AuthGuard({ children, redirectIfAuthenticated = false }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (redirectIfAuthenticated && isAuthenticated) {
        navigate('/dashboard', { replace: true });
      } else if (!redirectIfAuthenticated && !isAuthenticated) {
        navigate('/sign-in', { replace: true });
      }
    }
  }, [isAuthenticated, loading, navigate, redirectIfAuthenticated]);

  if (loading) {
    return null;
  }

  if (redirectIfAuthenticated && isAuthenticated) {
    return null;
  }

  if (!redirectIfAuthenticated && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
