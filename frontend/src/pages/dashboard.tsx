import { CONFIG } from 'src/config-global';

import { DashboardView } from 'src/sections/dashboard/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Dashboard - ${CONFIG.appName}`}</title>
      <meta
        name="description"
        content="SCO es un sistema de gestión integral para la clinica Gismondi que optimiza la administración de pacientes, citas y expedientes médicos."
      />
      <meta name="keywords" content="react,material,kit,application,dashboard,admin,template" />

      <DashboardView />
    </>
  );
}
