// TheCueRoom Production Configuration
export const config = {
  domain: 'thecueroom.xyz',
  siteUrl: 'https://thecueroom.xyz',
  apiUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.thecueroom.xyz',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

export const emailConfig = {
  adminEmail: 'admin@thecueroom.xyz',
  supportEmail: 'support@thecueroom.xyz',
  contactEmail: 'contact@thecueroom.xyz',
  noreplyEmail: 'support@thecueroom.xyz',
};
