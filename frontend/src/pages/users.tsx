import { CONFIG } from 'src/config-global';
import { UsersView } from 'src/sections/admin/users-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Gestión de Usuarios - ${CONFIG.appName}`}</title>
      <UsersView />
    </>
  );
}
