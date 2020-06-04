//import express from 'express'
import dotenv from 'dotenv'
//import cors from 'cors'
//import cookieParser from 'cookie-parser'
// import { ApolloServer } from 'apollo-server-express'
import { ApolloServer } from 'apollo-server'
import { applyMiddleware } from 'graphql-middleware'
import { schema } from './schema'
import { createContext } from './context'
import { permissions } from './permissions'

dotenv.config()

const PORT = process.env.PORT ?? 4000

//const app = express()

//app.use(cors({ credentials: true }))
//app.use(cookieParser())
//app.use(auth)

const schemaWithMiddleware = applyMiddleware(schema, permissions)

const server = new ApolloServer({
  schema: schemaWithMiddleware,
  context: createContext,
  cors: {
    origin: [
      'https://www.myexactjobs.com/',
      'http://localhost:3000',
      'https://myexactjobs.herokuapp.com',
      'https://www.myexactjobs.com',
    ],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['POST', 'GET'],
  },
  introspection: true,
  playground: true,
})

//server.applyMiddleware({ app })

server.listen({ port: PORT }, () =>
  console.log(
    `🚀 Server ready at: http://localhost:${PORT}${server.graphqlPath}\n⭐️ See sample queries: http://pris.ly/e/ts/graphql-apollo-server#using-the-graphql-api`,
  ),
)
