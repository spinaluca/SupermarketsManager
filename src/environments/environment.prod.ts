
export const environment = {
  production: true,
  get apiBaseUrl() {
    return 'https://api.st3pnymarket.mickysitiwp.it';
  }
};

export function getApiBaseUrl(): string {
  const customUrl = localStorage.getItem('custom_api_base_url');
  if (customUrl) return customUrl;
  return environment.apiBaseUrl;
}
