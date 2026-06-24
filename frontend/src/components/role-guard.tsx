import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from 'src/context/AuthContext';

// ----------------------------------------------------------------------

type RoleGuardProps = {
  children: React.ReactNode;
  allowedRoles: string[];
};

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const isAllowed = Boolean(user?.role && allowedRoles.includes(user.role));

  useEffect(() => {
    if (!loading && isAuthenticated && !isAllowed) {
      navigate('/projects', { replace: true });
    }
  }, [isAuthenticated, isAllowed, loading, navigate]);

  if (loading || !isAllowed) {
    return null;
  }

  return <>{children}</>;
}
