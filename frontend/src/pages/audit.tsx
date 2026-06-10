import { CONFIG } from 'src/config-global';
import { AuditView } from 'src/sections/admin/audit-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Auditoría de Actividad - ${CONFIG.appName}`}</title>
      <AuditView />
    </>
  );
}
