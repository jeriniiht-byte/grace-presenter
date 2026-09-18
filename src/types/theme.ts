export interface ThemeColors {
  background: string;
  text: string;
  reference: string;
  accent: string;
}

export interface ThemeSpacing {
  paddingX: string;
  paddingY: string;
}

export interface ThemeFont {
  family: string;
  size: string;
  weight: number;
  lineHeight: string;
  alignment: 'left' | 'center' | 'right';
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  fonts: {
    title: ThemeFont;
    body: ThemeFont;
    reference: ThemeFont;
  };
  backgroundImage?: string;
  backgroundVideo?: string;
}
