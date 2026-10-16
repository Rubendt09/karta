import { CONFIG } from 'src/config-global';
import { SurveysAdminView } from 'src/sections/admin/surveys-admin-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Encuestas y Resultados - ${CONFIG.appName}`}</title>
      <SurveysAdminView />
    </>
  );
}
