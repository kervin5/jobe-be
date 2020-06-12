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
  },
})

injectMiddleware()
schema.addToContext((req) => {
  //@ts-ignore
  const contextRequest: ContextRequest = { ...req }
  //@ts-ignore
  return { request: contextRequest, response: req.res }
})

use(prisma({ features: { crud: true } }))
use(permissions)

app.assemble()
export default server.handlers.graphql
