import { registerAs } from '@nestjs/config';

export default registerAs('everee', () => ({
  apiToken: process.env.EVEREE_API_TOKEN!,
  tenantId: process.env.EVEREE_TENANT_ID!,
  webhookSigningKey: process.env.EVEREE_WEBHOOK_SIGNING_KEY!,

  coreBaseUrl: process.env.EVEREE_CORE_BASE_URL!,
  embedBaseUrl: process.env.EVEREE_EMBED_BASE_URL!,
  integrationBaseUrl: process.env.EVEREE_INTEGRATION_BASE_URL!,
}));
