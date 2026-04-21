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

type RuntimeDataSourceConfig = Partial<
  Omit<DataSourceConfig, 'api'> & { api: Partial<DataSourceConfig['api']> }
>;

const DEFAULT_DATA_SOURCE_CONFIG: DataSourceConfig = {
  auth: 'api',
  ads: 'api',
  messages: 'api',
  api: {
    authBaseUrl: 'https://microservicesauth-service-production.up.railway.app',
    businessBaseUrl: 'https://microservicebusiness-service-production.up.railway.app'
  }
};

function runtimeOverrides(): RuntimeDataSourceConfig {
  if (typeof window === 'undefined') {
    return {};
  }

  const win = window as Window & {
    __MON_LOCATION_CONFIG__?: RuntimeDataSourceConfig;
  };

  return win.__MON_LOCATION_CONFIG__ ?? {};
}

function safeMode(value: unknown, fallback: DataSourceMode): DataSourceMode {
  return value === 'mock' || value === 'api' ? value : fallback;
}

function safeUrl(value: unknown, fallback: string): string {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export function getDataSourceConfig(): DataSourceConfig {
  const runtime = runtimeOverrides();

  return {
    auth: safeMode(runtime.auth, DEFAULT_DATA_SOURCE_CONFIG.auth),
    ads: safeMode(runtime.ads, DEFAULT_DATA_SOURCE_CONFIG.ads),
    messages: safeMode(runtime.messages, DEFAULT_DATA_SOURCE_CONFIG.messages),
    api: {
      authBaseUrl: safeUrl(runtime.api?.authBaseUrl, DEFAULT_DATA_SOURCE_CONFIG.api.authBaseUrl),
      businessBaseUrl: safeUrl(
        runtime.api?.businessBaseUrl,
        DEFAULT_DATA_SOURCE_CONFIG.api.businessBaseUrl
      )
    }
  };
}

