import type { LinkProps } from '@mui/material/Link';

import Link from '@mui/material/Link';
import { styled } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { mergeClasses } from 'src/utils/styles';

import { logoClasses } from './classes';
import logoSvg from './logo.svg';

// ----------------------------------------------------------------------

export type LogoProps = LinkProps & {
  isSingle?: boolean;
  disabled?: boolean;
};

export function Logo({
  sx,
  disabled,
  className,
  href = '/',
  isSingle = true,
  ...other
}: LogoProps) {
  return (
    <LogoRoot
      component={RouterLink}
      href={href}
      aria-label="Logo"
      underline="none"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        {
          width: 102,
          height: 36,
          ...(!isSingle && { width: 102, height: 36 }),
          ...(disabled && { pointerEvents: 'none' }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <img src={logoSvg} alt="Logo" style={{ width: '100%', height: '100%' }} />
    </LogoRoot>
  );
}

// ----------------------------------------------------------------------

const LogoRoot = styled(Link)(() => ({
  flexShrink: 0,
  color: 'transparent',
  display: 'inline-flex',
  verticalAlign: 'middle',
}));
