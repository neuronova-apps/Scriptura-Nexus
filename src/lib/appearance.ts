export const APPEARANCE_STORAGE_KEY = 'scriptura-nexus:appearance:v1';

export const APPEARANCE_THEMES = [
  'light',
  'dark',
  'contrast-light',
  'contrast-dark',
] as const;

export const APPEARANCE_FONT_SCALES = ['100', '115', '130'] as const;

export type AppearanceTheme = (typeof APPEARANCE_THEMES)[number];
export type AppearanceFontScale = (typeof APPEARANCE_FONT_SCALES)[number];

export interface AppearancePreferences {
  theme: AppearanceTheme;
  fontScale: AppearanceFontScale;
}

export interface AppearanceStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const DEFAULT_APPEARANCE_PREFERENCES: Readonly<AppearancePreferences> = {
  theme: 'light',
  fontScale: '100',
};

export function normalizeAppearancePreferences(value: unknown): AppearancePreferences {
  if (!value || typeof value !== 'object') {
    return { ...DEFAULT_APPEARANCE_PREFERENCES };
  }

  const candidate = value as Record<string, unknown>;
  const theme = APPEARANCE_THEMES.includes(candidate.theme as AppearanceTheme)
    ? (candidate.theme as AppearanceTheme)
    : DEFAULT_APPEARANCE_PREFERENCES.theme;
  const fontScale = APPEARANCE_FONT_SCALES.includes(String(candidate.fontScale) as AppearanceFontScale)
    ? (String(candidate.fontScale) as AppearanceFontScale)
    : DEFAULT_APPEARANCE_PREFERENCES.fontScale;

  return { theme, fontScale };
}

export function readAppearancePreferences(
  storage: Pick<AppearanceStorage, 'getItem'> | null,
): AppearancePreferences {
  if (!storage) return { ...DEFAULT_APPEARANCE_PREFERENCES };

  try {
    const stored = storage.getItem(APPEARANCE_STORAGE_KEY);
    if (!stored) return { ...DEFAULT_APPEARANCE_PREFERENCES };
    return normalizeAppearancePreferences(JSON.parse(stored));
  } catch {
    return { ...DEFAULT_APPEARANCE_PREFERENCES };
  }
}

export function saveAppearancePreferences(
  storage: Pick<AppearanceStorage, 'setItem'> | null,
  preferences: AppearancePreferences,
): boolean {
  if (!storage) return false;

  try {
    storage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(normalizeAppearancePreferences(preferences)));
    return true;
  } catch {
    return false;
  }
}

export function clearAppearancePreferences(
  storage: Pick<AppearanceStorage, 'removeItem'> | null,
): boolean {
  if (!storage) return false;

  try {
    storage.removeItem(APPEARANCE_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function applyAppearancePreferences(
  root: HTMLElement,
  preferences: AppearancePreferences,
): void {
  const normalized = normalizeAppearancePreferences(preferences);
  root.dataset.theme = normalized.theme;
  root.dataset.fontScale = normalized.fontScale;
}

function getBrowserStorage(): AppearanceStorage | null {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function initializeAppearance(
  documentRef: Document,
  storage: AppearanceStorage | null = getBrowserStorage(),
): void {
  const themeSelect = documentRef.querySelector<HTMLSelectElement>('[data-appearance-theme]');
  const fontScaleSelect = documentRef.querySelector<HTMLSelectElement>('[data-appearance-font-scale]');
  if (!themeSelect || !fontScaleSelect) return;

  const root = documentRef.documentElement;
  const status = documentRef.querySelector<HTMLElement>('[data-appearance-status]');
  const resetButton = documentRef.querySelector<HTMLButtonElement>('[data-appearance-reset]');
  const panel = documentRef.querySelector<HTMLDetailsElement>('[data-appearance-panel]');
  let preferences = readAppearancePreferences(storage);

  const apply = (next: AppearancePreferences, persist: boolean): void => {
    preferences = normalizeAppearancePreferences(next);
    applyAppearancePreferences(root, preferences);
    themeSelect.value = preferences.theme;
    fontScaleSelect.value = preferences.fontScale;

    if (persist && status) {
      status.textContent = saveAppearancePreferences(storage, preferences)
        ? 'Preferencias aplicadas y guardadas en este navegador.'
        : 'Preferencias aplicadas durante esta visita. El navegador no permitió guardarlas.';
    }
  };

  apply(preferences, false);
  if (panel) {
    panel.hidden = false;
    panel.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !panel.open) return;
      event.preventDefault();
      panel.open = false;
      panel.querySelector('summary')?.focus();
    });
  }

  themeSelect.addEventListener('change', () => {
    apply({ ...preferences, theme: themeSelect.value as AppearanceTheme }, true);
  });

  fontScaleSelect.addEventListener('change', () => {
    apply({ ...preferences, fontScale: fontScaleSelect.value as AppearanceFontScale }, true);
  });

  resetButton?.addEventListener('click', () => {
    const cleared = clearAppearancePreferences(storage);
    apply({ ...DEFAULT_APPEARANCE_PREFERENCES }, false);
    if (status) {
      status.textContent = cleared
        ? 'Se restableció la apariencia inicial.'
        : 'Se restableció la apariencia para esta visita; no fue posible limpiar el almacenamiento del navegador.';
    }
  });
}
