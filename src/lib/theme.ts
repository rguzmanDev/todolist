export const THEME = {
  // Prioridades de tareas
  priority: {
    low: '#94A3B8',       // slate-400 (más sofisticado)
    medium: '#F59E0B',    // amber-500
    high: '#EF4444',      // red-500
  },

  // Interfaz de usuario
  ui: {
    // Colores base
    background: '#FFFFFF',
    surface: '#F8FAFC',   // slate-50

    // Sidebar (más moderno, gris oscuro sofisticado)
    sidebar: {
      background: '#0F172A',  // slate-950 (más oscuro y elegante)
      text: '#CBD5E1',        // slate-300
      hover: '#1E293B',       // slate-800
      border: '#334155',      // slate-700
      accent: '#7C3AED',      // violet-600 (primario moderno)
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
        bg: '#7C3AED',            // violet-600 (NUEVO!)
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
      borderFocus: '#7C3AED',  // violet-600 (MATCHES primario)
      ring: '#A78BFA',         // violet-400
      text: '#0F172A',         // slate-950
      placeholder: '#94A3B8',  // slate-400
      error: '#DC2626',        // red-600
    },

    // Estados
    state: {
      hover: '#F8FAFC',        // slate-50
      active: '#F3E8FF',       // violet-50 (MATCHES primario)
      disabled: '#F1F5F9',     // slate-100
      focus: '#A78BFA',        // violet-400
    },

    // Gradientes frescos
    gradients: {
      primary: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
      header: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      subtle: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
    },
  },

  // Colores para libros (no cambiar nombres de variable)
  bookColors: {
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
  } as const,
} as const

/**
 * Alias para acceso rápido a colores de libros (array para iterar)
 */
export const BOOK_COLORS_ARRAY = Object.values(THEME.bookColors)

/**
 * Utilidad para obtener el color de un elemento por su tipo
 */
export function getColor(path: keyof typeof THEME | string): string {
  const keys = path.split('.')
  let value: any = THEME

  for (const key of keys) {
    value = value[key]
    if (value === undefined) {
      console.warn(`Color path not found: ${path}`)
      return '#000000'
    }
  }

  return value as string
}
