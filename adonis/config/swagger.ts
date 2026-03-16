import path from 'node:path'
import url from 'node:url'

export default {
  path: `${path.dirname(url.fileURLToPath(import.meta.url))}/../`,
  info: {
    title: 'BeTalent Payments API',
    version: '1.0.0',
    description: 'REST API for payment processing with gateway fallback and role-based access.',
  },
  tagIndex: 3,
  snakeCase: false,
  ignore: ['/swagger', '/docs'],
  preferredPutPatch: 'PATCH',
  common: {
    parameters: {},
    headers: {},
  },
  authMiddlewares: ['auth'],
  defaultSecurityScheme: 'BearerAuth',
  securitySchemes: {
    BearerAuth: {
      type: 'http',
      scheme: 'bearer',
    },
  },
  persistAuthorization: true,
}
