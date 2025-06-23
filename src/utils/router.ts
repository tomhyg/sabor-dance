export const getAuthPageFromUrl = (): string => {
  const path = window.location.pathname;
  const search = window.location.search;
  
  if (path.includes('/auth/confirm')) {
    return 'confirm-email';
  }
  
  if (path.includes('/auth/reset-password')) {
    return 'reset-password';
  }
  
  return 'app';
};

export const navigateToAuthPage = (page: string, params?: Record<string, string>) => {
  let url = `/auth/${page}`;
  
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }
  
  window.history.pushState({}, '', url);
};

export const navigateToHome = () => {
  window.history.pushState({}, '', '/');
};
