import { CONFIG } from 'src/config-global';
import { SurveyView } from 'src/sections/surveys/survey-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Encuesta - ${CONFIG.appName}`}</title>
      <SurveyView />
    </>
  );
}
