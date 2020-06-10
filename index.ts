import dotenv from 'dotenv'

// import { ApolloServer } from 'apollo-server'
// import { applyMiddleware } from 'graphql-middleware'
// import { schema } from './schema'
import { injectMiddleware } from './src/context'
import { permissions } from './src/permissions'

// const PORT = process.env.PORT ?? 4000

// const schemaWithMiddleware = applyMiddleware(schema, permissions)

// const server = new ApolloServer({
//   schema: schemaWithMiddleware,
//   context: createContext,
//   cors: {
//     origin: [
//       'https://www.myexactjobs.com/',
//       'http://localhost:3000',
//       'https://myexactjobs.herokuapp.com',
//       'https://www.myexactjobs.com',
//     ],
//     credentials: true,
//     optionsSuccessStatus: 200,
//     methods: ['POST', 'GET'],
//   },
//   introspection: true,
//   playground: true,
// })

// //server.applyMiddleware({ app })

// server.listen({ port: PORT }, () =>
//   console.log(
//     `🚀 Server ready at: http://localhost:${PORT}${server.graphqlPath}\n⭐️ See sample queries: http://pris.ly/e/ts/graphql-apollo-server#using-the-graphql-api`,
//   ),
// )
import { use } from 'nexus'
import { prisma } from 'nexus-plugin-prisma'

dotenv.config()

injectMiddleware()
use(prisma())
use(permissions)
