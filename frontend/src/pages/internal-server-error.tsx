import { CONFIG } from 'src/config-global';

import { InternalServerErrorView } from 'src/sections/error';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`500 Internal Server Error | Error - ${CONFIG.appName}`}</title>

      <InternalServerErrorView />
    </>
  );
}
