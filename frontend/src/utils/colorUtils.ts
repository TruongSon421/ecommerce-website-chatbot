export const shouldShowColor = (color: string | null | undefined): boolean => {
  return !(!color || color === 'default');
}; 