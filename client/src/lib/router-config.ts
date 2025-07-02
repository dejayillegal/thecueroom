// Router configuration for GitHub Pages subdirectory hosting
export const getBasePath = () => {
  // For GitHub Pages subdirectory deployment (username.github.io/repo-name/)
  if (typeof window !== 'undefined') {
    const basePath = import.meta.env.VITE_BASE_PATH || '/';
    return basePath;
  }
  return '/';
};

export const getRouterBase = () => {
  const basePath = getBasePath();
  // Remove trailing slash for wouter base
  return basePath === '/' ? '' : basePath.replace(/\/$/, '');
};