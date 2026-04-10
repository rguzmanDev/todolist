export type ThemeMode = 'light' | 'dark'

/**
 * Sistema tipografico centralizado
 * Fuente: Inter (Google Fonts) — moderna, legible, ideal para interfaces
 */
export const TYPOGRAPHY = {
  fontFamily: {
    sans: "var(--font-sans), 'Inter', system-ui, -apple-system, sans-serif",
    mono: "var(--font-mono), 'Fira Code', 'Cascadia Code', monospace",
  },
  fontSize: {
    app: '15px',       // Base de la app
    sm: '0.875rem',    // 13.1px
    xs: '0.8125rem',   // 12.2px
    base: '1rem',      // 15px relativo al app
    lg: '1.125rem',    // Titulos menores
    xl: '1.25rem',     // Titulos mayores
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.625',
  },
} as const

type ThemeColors = typeof LIGHT_THEME

const LIGHT_THEME = {
  // Prioridades de tareas
  priority: {
    low: '#94A3B8',       // slate-400
    medium: '#F59E0B',    // amber-500
    high: '#EF4444',      // red-500
  },

  // Interfaz de usuario
  ui: {
    // Colores base
    background: '#FFFFFF',
    surface: '#F8FAFC',   // slate-50

    // Sidebar
    sidebar: {
      background: '#1A1040',
      text: '#C4B5FD',
      hover: '#2D1F6E',
      border: '#3B2A80',
      accent: '#7C3AED',      // violet-600
    },

    // Texto
    text: {
      primary: '#0F172A',    // slate-950
      secondary: '#64748B',  // slate-500
      tertiary: '#94A3B8',   // slate-400
      light: '#F1F5F9',      // slate-100
    },

    // Bordes
    border: {
      light: '#E2E8F0',     // slate-200
      medium: '#CBD5E1',    // slate-300
      dark: '#94A3B8',      // slate-400
    },

    // Botones
    button: {
      primary: {
        bg: '#7C3AED',            // violet-600
        bgHover: '#6D28D9',       // violet-700
        text: '#FFFFFF',
        ring: '#A78BFA',          // violet-400
      },
      secondary: {
        bg: '#FFFFFF',
        bgHover: '#F8FAFC',       // slate-50
        text: '#0F172A',          // slate-950
        border: '#E2E8F0',        // slate-200
        ring: '#94A3B8',          // slate-400
      },
      ghost: {
        text: '#475569',          // slate-600
        bgHover: '#F1F5F9',       // slate-100
        ring: '#94A3B8',          // slate-400
      },
      danger: {
        bg: '#FEE2E2',            // red-50
        bgHover: '#FECACA',       // red-200
        text: '#DC2626',          // red-600
        ring: '#F87171',          // red-400
      },
    },

    // Inputs y formularios
    input: {
      bg: '#FFFFFF',
      border: '#E2E8F0',       // slate-200
      borderFocus: '#7C3AED',  // violet-600
      ring: '#A78BFA',         // violet-400
      text: '#0F172A',         // slate-950
      placeholder: '#94A3B8',  // slate-400
      error: '#DC2626',        // red-600
    },

    // Estados
    state: {
      hover: '#F8FAFC',        // slate-50
      active: '#F3E8FF',       // violet-50
      disabled: '#F1F5F9',     // slate-100
      focus: '#A78BFA',        // violet-400
    },

    // Gradientes
    gradients: {
      primary: 'linear-gradient(135deg, #0EA5E9 0%, #0891B2 100%)',
      header: 'linear-gradient(135deg, #0A1520 0%, #162535 100%)',
      subtle: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
    },
  },
} as const

const DARK_THEME = {
  // Prioridades de tareas
  priority: {
    low: '#64748B',       // slate-500
    medium: '#FBBF24',    // amber-400
    high: '#F87171',      // red-400
  },

  // Interfaz de usuario
  ui: {
    // Colores base
    background: '#0F172A',  // slate-950
    surface: '#1E293B',     // slate-800

    // Sidebar
    sidebar: {
      background: '#020617',  // slate-950 mas oscuro
      text: '#E2E8F0',        // slate-200
      hover: '#334155',       // slate-700
      border: '#475569',      // slate-600
      accent: '#A78BFA',      // violet-400
    },

    // Texto
    text: {
      primary: '#F1F5F9',    // slate-100
      secondary: '#CBD5E1',  // slate-300
      tertiary: '#94A3B8',   // slate-400
      light: '#64748B',      // slate-500
    },

    // Bordes
    border: {
      light: '#334155',     // slate-700
      medium: '#475569',    // slate-600
      dark: '#64748B',      // slate-500
    },

    // Botones
    button: {
      primary: {
        bg: '#8B5CF6',            // violet-500
        bgHover: '#A78BFA',       // violet-400
        text: '#FFFFFF',
        ring: '#6D28D9',          // violet-700
      },
      secondary: {
        bg: '#1E293B',
        bgHover: '#334155',       // slate-700
        text: '#F1F5F9',          // slate-100
        border: '#475569',        // slate-600
        ring: '#64748B',          // slate-500
      },
      ghost: {
        text: '#CBD5E1',          // slate-300
        bgHover: '#334155',       // slate-700
        ring: '#64748B',          // slate-500
      },
      danger: {
        bg: '#7F1D1D',            // red-900
        bgHover: '#991B1B',       // red-800
        text: '#FECACA',          // red-200
        ring: '#F87171',          // red-400
      },
    },

    // Inputs y formularios
    input: {
      bg: '#1E293B',
      border: '#475569',       // slate-600
      borderFocus: '#8B5CF6',  // violet-500
      ring: '#A78BFA',         // violet-400
      text: '#F1F5F9',         // slate-100
      placeholder: '#64748B',  // slate-500
      error: '#FCA5A5',        // red-300
    },

    // Estados
    state: {
      hover: '#334155',        // slate-700
      active: '#6D28D9',       // violet-700
      disabled: '#1F2937',     // gray-800
      focus: '#A78BFA',        // violet-400
    },

    // Gradientes
    gradients: {
      primary: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
      header: 'linear-gradient(135deg, #020617 0%, #0F172A 100%)',
      subtle: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
    },
  },
} as const

export const THEMES = {
  light: LIGHT_THEME,
  dark: DARK_THEME,
}

export const THEME = LIGHT_THEME

/**
 * Colores para libros
 */
export const BOOK_COLORS = {
  red: '#EF4444',
  orange: '#F97316',
  yellow: '#EAB308',
  green: '#22C55E',
  blue: '#3B82F6',
  purple: '#8B5CF6',
  pink: '#EC4899',
  teal: '#14B8A6',
  amber: '#F59E0B',
  cyan: '#06B6D4',
} as const

/**
 * Alias para acceso rapido a colores de libros (array para iterar)
 */
export const BOOK_COLORS_ARRAY = Object.values(BOOK_COLORS)

/**
 * Obtener el tema actual
 */
export function getTheme(mode: ThemeMode = 'light'): ThemeColors {
  return THEMES[mode] as ThemeColors
}

/**
 * Utilidad para obtener el color de un elemento por su tipo
 */
export function getColor(path: keyof typeof THEME | string, mode: ThemeMode = 'light'): string {
  const keys = (path as string).split('.')
  let value: any = getTheme(mode)

  for (const key of keys) {
    value = value[key]
    if (value === undefined) {
      console.warn(`Color path not found: ${path}`)
      return '#000000'
    }
  }

  return value as string
}
