import { CONFIG } from 'src/config-global';
import { InvitationsView } from 'src/sections/invitations/invitations-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Mis Invitaciones - ${CONFIG.appName}`}</title>
      <InvitationsView />
    </>
  );
}
