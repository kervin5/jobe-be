import { ApolloServer } from 'apollo-server'
import { applyMiddleware } from 'graphql-middleware'
import { schema } from './schema'
import { createContext } from './context'
import { permissions } from './permissions'

const injectUser = async (resolve, root, args, context, info) => {
  const Authorization = context.headers['authorization']
  // if (Authorization) {
  //   const token = Authorization.replace('Bearer ', '')
  //   const verifiedToken = verify(token, APP_SECRET) as Token
  //   return verifiedToken && verifiedToken.userId
  // }

  console.log(Object.keys(context.headers), Authorization)
  const result = await resolve(root, args, context, info)
  console.log(`5. logInput`)
  return result
}

const schemaWithMiddleware = applyMiddleware(schema, injectUser, permissions)

new ApolloServer({
  schema: schemaWithMiddleware,
  context: createContext,
}).listen({ port: 4000 }, () =>
  console.log(
    `🚀 Server ready at: http://localhost:4000\n⭐️ See sample queries: http://pris.ly/e/ts/graphql-apollo-server#using-the-graphql-api`,
  ),
)
