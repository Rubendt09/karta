import { CONFIG } from 'src/config-global';
import { ProjectDetailView } from 'src/sections/projects/project-detail-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Detalle de Proyecto - ${CONFIG.appName}`}</title>
      <ProjectDetailView />
    </>
  );
}
