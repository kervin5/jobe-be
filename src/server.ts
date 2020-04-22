import { ApolloServer } from 'apollo-server'
import { applyMiddleware } from 'graphql-middleware'
import { schema } from './schema'
import { createContext } from './context'
import {permissions} from "./permissions"

const schemaWithMiddleware = applyMiddleware(
  schema,
 permissions
)

new ApolloServer({ schema: schemaWithMiddleware, context: createContext }).listen(
  { port: 4000 },
  () =>
    console.log(
      `🚀 Server ready at: http://localhost:4000\n⭐️ See sample queries: http://pris.ly/e/ts/graphql-apollo-server#using-the-graphql-api`,
    ),
)
