/**
 * Utility functions for styling
 */

/**
 * Converts pixels to rem units
 */
export function pxToRem(value: number): string {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error(`Invalid pixel value: ${value}`);
  }
  return `${value / 16}rem`;
}

/**
 * Sets font family with fallbacks
 */
const DEFAULT_FONT_FAMILY = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`;

export function setFont(fontName?: string): string {
  return fontName ? `"${fontName}", ${DEFAULT_FONT_FAMILY}` : DEFAULT_FONT_FAMILY;
}

/**
 * Creates an alpha variant of a CSS variable color
 * Supports RGB channels and CSS variables
 * @example varAlpha('200 250 214', 0.8) => 'rgba(200 250 214 / 80%)'
 * @example varAlpha('var(--palette-primary-mainChannel)', 0.8) => 'rgba(var(--palette-primary-mainChannel) / 80%)'
 */
function validateOpacity(opacity: string | number, color: string): string {
  const type = typeof opacity;

  if (type === 'number') {
    return `${(opacity as number) * 100}%`;
  }

  if (type === 'string' && (opacity as string).endsWith('%')) {
    return opacity as string;
  }

  if (type === 'string') {
    const numericValue = parseFloat(opacity as string);
    if (!isNaN(numericValue)) {
      return `${numericValue * 100}%`;
    }
  }

  if (type === 'string' && (opacity as string).startsWith('var(')) {
    return `calc(${opacity} * 100%)`;
  }

  throw new Error(`[Alpha]: Invalid opacity "${opacity}" for color "${color}"`);
}

export function varAlpha(color: string, opacity: string | number = 1): string {
  if (!color?.trim()) {
    throw new Error('[Alpha]: Color is undefined or empty!');
  }

  const isUnsupported =
    color.startsWith('#') ||
    color.startsWith('rgb') ||
    color.startsWith('rgba') ||
    (!color.includes('var') && color.includes('Channel'));

  if (isUnsupported) {
    throw new Error(
      [
        `[Alpha]: Unsupported color format "${color}"`,
        '✅ Supported formats:',
        '- RGB channels: "0 184 217"',
        '- CSS variables with "Channel" prefix: "var(--palette-common-blackChannel, #000000)"',
        '❌ Unsupported formats:',
        '- Hex: "#00B8D9"',
        '- RGB: "rgb(0, 184, 217)"',
        '- RGBA: "rgba(0, 184, 217, 1)"',
      ].join('\n')
    );
  }

  const alpha = validateOpacity(opacity, color);

  if (color.toLowerCase() === 'currentcolor') {
    return `color-mix(in srgb, currentColor ${alpha}, transparent)`;
  }

  return `rgba(${color} / ${alpha})`;
}

/**
 * Converts a hex color to RGB channels
 */
function hexToRgbChannel(hex: string): string {
  if (!hex?.trim()) {
    throw new Error('Hex color is undefined!');
  }

  const sanitizedHex = hex.replace('#', '');

  if (!/^[0-9A-Fa-f]{6}$/.test(sanitizedHex)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  const r = parseInt(sanitizedHex.substring(0, 2), 16);
  const g = parseInt(sanitizedHex.substring(2, 4), 16);
  const b = parseInt(sanitizedHex.substring(4, 6), 16);

  return `${r} ${g} ${b}`;
}

/**
 * Creates palette channel variables for CSS
 * Converts color objects to include RGB channel properties
 */
export function createPaletteChannel<T extends Record<string, any>>(hexPalette: T): T & Record<string, string> {
  const channelPalette: Record<string, string | undefined> = {};

  Object.entries(hexPalette).forEach(([key, value]) => {
    if (value) {
      channelPalette[`${key}Channel`] = hexToRgbChannel(value);
    }
  });

  return { ...hexPalette, ...channelPalette } as T & Record<string, string>;
}

/**
 * Merges class names with state-based class names
 */
export type StateProps = {
  [key: string]: boolean | undefined | [boolean, string];
};

export function mergeClasses(
  className?: string | (string | undefined)[] | null,
  state?: StateProps
): string {
  const baseClass = Array.isArray(className)
    ? className.filter(Boolean).join(' ')
    : className || '';

  if (!state) {
    return baseClass;
  }

  const stateClasses = Object.entries(state)
    .filter(([, value]) => {
      if (Array.isArray(value)) {
        return value[0];
      }
      return value === true;
    })
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value[1];
      }
      return key;
    })
    .join(' ');

  return [baseClass, stateClasses].filter(Boolean).join(' ');
}
