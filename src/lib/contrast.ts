/** Calcula la relación de contraste WCAG entre dos colores hexadecimales. */
function luminance(hex: string): number {
  const normalized = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    throw new Error(`Color hexadecimal inválido: ${hex}`);
  }
  const channels = [0, 2, 4].map((offset) => {
    const value = Number.parseInt(normalized.slice(offset, offset + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function contrastRatio(foreground: string, background: string): number {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}
