import dotenv from 'dotenv'
import { injectMiddleware } from './src/middleware'
import { permissions } from './src/permissions'
import app, { server, use, schema } from 'nexus'
import { prisma } from 'nexus-plugin-prisma'
import { settings } from 'nexus'
import { ContextRequest } from './types/context'

dotenv.config()
const PORT = parseInt(process.env.PORT ?? `${4000}`)
settings.change({
  server: {
    port: PORT,
    playground: true,
    graphql: {
      introspection: true,
    },
    cors: {
      origin: [
        process.env.FRONTEND_URL as string,
        'http://localhost:3000',
        ...(process.env?.ALLOWED_DOMAINS
          ? process.env?.ALLOWED_DOMAINS.split(',')
          : []),
      ],
      credentials: true,
      optionsSuccessStatus: 200,
      methods: ['POST', 'GET'],
    },
  },
})

injectMiddleware()
schema.addToContext((req) => {
  //@ts-ignore
  const contextRequest: ContextRequest = { ...req }
  //@ts-ignore
  return { request: contextRequest.req, response: req.res }
})

use(prisma({ features: { crud: true } }))
use(permissions)

app.assemble()
export default server.handlers.graphql
