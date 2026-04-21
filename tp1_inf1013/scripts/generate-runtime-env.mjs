import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const boolLike = (value, fallback) => {
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim().toLowerCase();
  return normalized === 'api' || normalized === 'mock' ? normalized : fallback;
};

const stringLike = (value, fallback) => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

const config = {
  auth: boolLike(process.env.MON_LOCATION_AUTH_MODE, 'api'),
  ads: boolLike(process.env.MON_LOCATION_ADS_MODE, 'api'),
  messages: boolLike(process.env.MON_LOCATION_MESSAGES_MODE, 'api'),
  api: {
    authBaseUrl: stringLike(
      process.env.MON_LOCATION_AUTH_BASE_URL,
      'https://microservicesauth-service-production.up.railway.app'
    ),
    businessBaseUrl: stringLike(
      process.env.MON_LOCATION_BUSINESS_BASE_URL,
      'https://microservicebusiness-service-production.up.railway.app'
    )
  }
};

const envFileContent = `window.__MON_LOCATION_CONFIG__ = ${JSON.stringify(config, null, 2)};\n`;

const outputPath = resolve(process.cwd(), 'public', 'env.js');
await mkdir(resolve(process.cwd(), 'public'), { recursive: true });
await writeFile(outputPath, envFileContent, 'utf8');

console.log(`[runtime-config] Generated ${outputPath}`);

