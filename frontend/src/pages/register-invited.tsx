import { CONFIG } from 'src/config-global';
import { RegisterInvitedView } from 'src/sections/auth/register-invited-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Registro de Invitado - ${CONFIG.appName}`}</title>
      <RegisterInvitedView />
    </>
  );
}
