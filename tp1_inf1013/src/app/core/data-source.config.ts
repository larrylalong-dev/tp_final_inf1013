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

// Toggle these values to switch progressively from mocked local data to microservices.
export const DATA_SOURCE_CONFIG: DataSourceConfig = {
  auth: 'mock',
  ads: 'mock',
  messages: 'mock',
  api: {
    authBaseUrl: 'http://localhost:8081',
    businessBaseUrl: 'http://localhost:8082'
  }
};

