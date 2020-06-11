import dotenv from 'dotenv'
import { injectMiddleware } from './src/context'
import { permissions } from './src/permissions'
import app, { server, use, schema } from 'nexus'
import { prisma } from 'nexus-plugin-prisma'
import { settings } from 'nexus'

dotenv.config()
const PORT = parseInt(process.env.PORT ?? `${4000}`)
settings.change({
  server: {
    port: PORT,
    playground: true,
  },
})

const expressContext = injectMiddleware()

schema.addToContext((req) => {
  return { ...expressContext }
})

use(prisma({ features: { crud: true } }))
use(permissions)

app.assemble()
export default server.handlers.graphql
