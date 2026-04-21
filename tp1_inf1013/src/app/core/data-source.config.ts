export type DataSourceMode = 'mock' | 'api';

export interface DataSourceConfig {
  auth: DataSourceMode;
  ads: DataSourceMode;
  messages: DataSourceMode;
  api: {
    authBaseUrl: string;
    businessBaseUrl: string;
  };
}

// Railway production setup
export const DATA_SOURCE_CONFIG: DataSourceConfig = {
  auth: 'api',
  ads: 'api',
  messages: 'api',
  api: {
    authBaseUrl: 'https://microservicesauth-service-production.up.railway.app',
    businessBaseUrl: 'https://microservicebusiness-service-production.up.railway.app'
  }
};
