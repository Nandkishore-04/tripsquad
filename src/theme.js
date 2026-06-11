// TripSquad design system — dark, glassy, gradient-heavy.
export const colors = {
  bg: '#08070D',
  bgElevated: '#100F1A',
  card: 'rgba(255,255,255,0.05)',
  cardBorder: 'rgba(255,255,255,0.09)',
  cardBorderBright: 'rgba(168,130,255,0.45)',
  text: '#F4F2FF',
  textDim: '#9B96B8',
  textFaint: '#5E5A78',
  primary: '#A878FF',
  primaryDark: '#7C3AED',
  accent: '#FF5CA8',
  cyan: '#4DE1FF',
  green: '#3DE8A0',
  yellow: '#FFD166',
  red: '#FF6B6B',
};

export const gradients = {
  brand: ['#7C3AED', '#C026D3', '#FF5CA8'],
  cool: ['#4DE1FF', '#7C3AED'],
  fire: ['#FF8A3D', '#FF5CA8'],
  mint: ['#3DE8A0', '#4DE1FF'],
  dusk: ['#1A1530', '#08070D'],
};

export const avatarPalette = [
  ['#7C3AED', '#FF5CA8'],
  ['#4DE1FF', '#7C3AED'],
  ['#3DE8A0', '#4DE1FF'],
  ['#FF8A3D', '#FF5CA8'],
  ['#FFD166', '#FF8A3D'],
  ['#FF6B6B', '#C026D3'],
];

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 };

export const spacing = { xs: 4, sm: 8, md: 14, lg: 20, xl: 28 };

export const shadowGlow = (color = colors.primary, opacity = 0.35) => ({
  shadowColor: color,
  shadowOpacity: opacity,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 6 },
  elevation: 10,
});
