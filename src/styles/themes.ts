import type { Theme } from '../types/theme';

export const FONT_STACKS = {
  en: '"Noto Sans", Inter, system-ui, sans-serif',
  ta: '"Noto Sans Tamil", "Noto Sans", sans-serif',
  ml: '"Noto Sans Malayalam", "Noto Sans", sans-serif'
};

export const PREDEFINED_THEMES: Record<string, Theme> = {
  salemag: {
    id: 'salemag',
    name: 'Salem AG Church',
    description: "Matches salemagchurch.com's navy, gold and beige palette",
    colors: {
      background: '#012646',
      text: '#ffffff',
      reference: '#d3ccba',
      accent: '#d29d3e'
    },
    spacing: { paddingX: '3rem', paddingY: '2rem' },
    fonts: {
      title: { family: FONT_STACKS.en, size: '3rem', weight: 700, lineHeight: '1.2', alignment: 'center' },
      body: { family: FONT_STACKS.en, size: '2rem', weight: 400, lineHeight: '1.6', alignment: 'center' },
      reference: { family: FONT_STACKS.en, size: '1.25rem', weight: 400, lineHeight: '1.4', alignment: 'center' }
    }
  },

  dark: {
    id: 'dark',
    name: 'Dark',
    description: 'High contrast dark theme for projectors',
    colors: {
      background: '#000000',
      text: '#ffffff',
      reference: '#a0a0a0',
      accent: '#4a90e2'
    },
    spacing: {
      paddingX: '3rem',
      paddingY: '2rem'
    },
    fonts: {
      title: {
        family: FONT_STACKS.en,
        size: '3rem',
        weight: 700,
        lineHeight: '1.2',
        alignment: 'center'
      },
      body: {
        family: FONT_STACKS.en,
        size: '2rem',
        weight: 400,
        lineHeight: '1.6',
        alignment: 'center'
      },
      reference: {
        family: FONT_STACKS.en,
        size: '1.25rem',
        weight: 400,
        lineHeight: '1.4',
        alignment: 'center'
      }
    }
  },

  light: {
    id: 'light',
    name: 'Light',
    description: 'Light theme for well-lit rooms',
    colors: {
      background: '#ffffff',
      text: '#1a1a1a',
      reference: '#666666',
      accent: '#0066cc'
    },
    spacing: {
      paddingX: '3rem',
      paddingY: '2rem'
    },
    fonts: {
      title: {
        family: FONT_STACKS.en,
        size: '3rem',
        weight: 700,
        lineHeight: '1.2',
        alignment: 'center'
      },
      body: {
        family: FONT_STACKS.en,
        size: '2rem',
        weight: 400,
        lineHeight: '1.6',
        alignment: 'center'
      },
      reference: {
        family: FONT_STACKS.en,
        size: '1.25rem',
        weight: 400,
        lineHeight: '1.4',
        alignment: 'center'
      }
    }
  },

  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, minimal aesthetic with lots of whitespace',
    colors: {
      background: '#f5f5f5',
      text: '#2d2d2d',
      reference: '#999999',
      accent: '#333333'
    },
    spacing: {
      paddingX: '4rem',
      paddingY: '3rem'
    },
    fonts: {
      title: {
        family: FONT_STACKS.en,
        size: '2.5rem',
        weight: 400,
        lineHeight: '1.3',
        alignment: 'center'
      },
      body: {
        family: FONT_STACKS.en,
        size: '1.75rem',
        weight: 300,
        lineHeight: '1.7',
        alignment: 'center'
      },
      reference: {
        family: FONT_STACKS.en,
        size: '1rem',
        weight: 300,
        lineHeight: '1.5',
        alignment: 'center'
      }
    }
  },

  worship: {
    id: 'worship',
    name: 'Worship',
    description: 'Warm, inviting theme for worship settings',
    colors: {
      background: '#1a2a3a',
      text: '#ffffff',
      reference: '#d4af37',
      accent: '#e8b923'
    },
    spacing: {
      paddingX: '3.5rem',
      paddingY: '2.5rem'
    },
    fonts: {
      title: {
        family: FONT_STACKS.en,
        size: '3.2rem',
        weight: 700,
        lineHeight: '1.2',
        alignment: 'center'
      },
      body: {
        family: FONT_STACKS.en,
        size: '2.2rem',
        weight: 400,
        lineHeight: '1.8',
        alignment: 'center'
      },
      reference: {
        family: FONT_STACKS.en,
        size: '1.3rem',
        weight: 400,
        lineHeight: '1.5',
        alignment: 'center'
      }
    }
  },

  elegant: {
    id: 'elegant',
    name: 'Elegant',
    description: 'Sophisticated and refined theme',
    colors: {
      background: '#2c2c2c',
      text: '#f0f0f0',
      reference: '#b8860b',
      accent: '#daa520'
    },
    spacing: {
      paddingX: '4rem',
      paddingY: '3rem'
    },
    fonts: {
      title: {
        family: '"Georgia", serif, sans-serif',
        size: '3.5rem',
        weight: 700,
        lineHeight: '1.15',
        alignment: 'center'
      },
      body: {
        family: '"Georgia", serif, sans-serif',
        size: '2.1rem',
        weight: 400,
        lineHeight: '1.7',
        alignment: 'center'
      },
      reference: {
        family: FONT_STACKS.en,
        size: '1.2rem',
        weight: 400,
        lineHeight: '1.5',
        alignment: 'center'
      }
    }
  },

  scripture: {
    id: 'scripture',
    name: 'Scripture',
    description: 'Traditional theme for scripture reading',
    colors: {
      background: '#f4e8d8',
      text: '#3d3d3d',
      reference: '#8b6914',
      accent: '#c19a6b'
    },
    spacing: {
      paddingX: '3rem',
      paddingY: '2.5rem'
    },
    fonts: {
      title: {
        family: '"Georgia", serif, sans-serif',
        size: '2.8rem',
        weight: 700,
        lineHeight: '1.3',
        alignment: 'center'
      },
      body: {
        family: '"Georgia", serif, sans-serif',
        size: '2rem',
        weight: 400,
        lineHeight: '1.8',
        alignment: 'center'
      },
      reference: {
        family: FONT_STACKS.en,
        size: '1.1rem',
        weight: 400,
        lineHeight: '1.6',
        alignment: 'center'
      }
    }
  },

  sunset: {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm orange and pink tones',
    colors: {
      background: '#3a1a2c',
      text: '#fff2e6',
      reference: '#ffb37a',
      accent: '#ff7e5f'
    },
    spacing: { paddingX: '3rem', paddingY: '2rem' },
    fonts: {
      title: { family: FONT_STACKS.en, size: '3rem', weight: 700, lineHeight: '1.2', alignment: 'center' },
      body: { family: FONT_STACKS.en, size: '2rem', weight: 400, lineHeight: '1.6', alignment: 'center' },
      reference: { family: FONT_STACKS.en, size: '1.25rem', weight: 400, lineHeight: '1.4', alignment: 'center' }
    }
  },

  ocean: {
    id: 'ocean',
    name: 'Ocean',
    description: 'Cool blues and teals',
    colors: {
      background: '#0a2540',
      text: '#e6f7ff',
      reference: '#7ec8e3',
      accent: '#2ec4b6'
    },
    spacing: { paddingX: '3rem', paddingY: '2rem' },
    fonts: {
      title: { family: FONT_STACKS.en, size: '3rem', weight: 700, lineHeight: '1.2', alignment: 'center' },
      body: { family: FONT_STACKS.en, size: '2rem', weight: 400, lineHeight: '1.6', alignment: 'center' },
      reference: { family: FONT_STACKS.en, size: '1.25rem', weight: 400, lineHeight: '1.4', alignment: 'center' }
    }
  },

  forest: {
    id: 'forest',
    name: 'Forest',
    description: 'Earthy greens for a natural feel',
    colors: {
      background: '#122b1c',
      text: '#eaf5ec',
      reference: '#9fd8a3',
      accent: '#4caf6e'
    },
    spacing: { paddingX: '3rem', paddingY: '2rem' },
    fonts: {
      title: { family: FONT_STACKS.en, size: '3rem', weight: 700, lineHeight: '1.2', alignment: 'center' },
      body: { family: FONT_STACKS.en, size: '2rem', weight: 400, lineHeight: '1.6', alignment: 'center' },
      reference: { family: FONT_STACKS.en, size: '1.25rem', weight: 400, lineHeight: '1.4', alignment: 'center' }
    }
  },

  royal: {
    id: 'royal',
    name: 'Royal',
    description: 'Deep purple with gold accents',
    colors: {
      background: '#241436',
      text: '#f5f0ff',
      reference: '#d4af37',
      accent: '#c9a227'
    },
    spacing: { paddingX: '3.5rem', paddingY: '2.5rem' },
    fonts: {
      title: { family: '"Georgia", serif, sans-serif', size: '3.2rem', weight: 700, lineHeight: '1.2', alignment: 'center' },
      body: { family: '"Georgia", serif, sans-serif', size: '2.1rem', weight: 400, lineHeight: '1.7', alignment: 'center' },
      reference: { family: FONT_STACKS.en, size: '1.2rem', weight: 400, lineHeight: '1.5', alignment: 'center' }
    }
  },

  midnight: {
    id: 'midnight',
    name: 'Midnight',
    description: 'Ultra-dark high-contrast theme for night services',
    colors: {
      background: '#050810',
      text: '#f0f4ff',
      reference: '#6b8fd4',
      accent: '#3d5dc9'
    },
    spacing: { paddingX: '3rem', paddingY: '2rem' },
    fonts: {
      title: { family: FONT_STACKS.en, size: '3rem', weight: 700, lineHeight: '1.2', alignment: 'center' },
      body: { family: FONT_STACKS.en, size: '2rem', weight: 400, lineHeight: '1.6', alignment: 'center' },
      reference: { family: FONT_STACKS.en, size: '1.25rem', weight: 400, lineHeight: '1.4', alignment: 'center' }
    }
  },

  celebration: {
    id: 'celebration',
    name: 'Celebration',
    description: 'Festive red and green for special occasions',
    colors: {
      background: '#1a2e1a',
      text: '#fff5f5',
      reference: '#f4c95d',
      accent: '#d9464b'
    },
    spacing: { paddingX: '3rem', paddingY: '2rem' },
    fonts: {
      title: { family: FONT_STACKS.en, size: '3.2rem', weight: 700, lineHeight: '1.2', alignment: 'center' },
      body: { family: FONT_STACKS.en, size: '2rem', weight: 400, lineHeight: '1.6', alignment: 'center' },
      reference: { family: FONT_STACKS.en, size: '1.25rem', weight: 400, lineHeight: '1.4', alignment: 'center' }
    }
  }
};
