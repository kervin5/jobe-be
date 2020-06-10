import cookieParser from 'cookie-parser'
import auth from './middleware/auth'
// import { ContextContributor } from 'nexus/dist/runtime/schema/schema'
import { server, schema } from 'nexus'

const cp = cookieParser()
// const addCookies = (req: any, res: any) =>
//   new Promise((resolve) => {
//     cp(req, res, resolve)
//   })
// const authorization = (req: any, res: any) =>
//   new Promise((resolve) => {
//     auth(req, res, resolve)
//   })

export interface Context {
  request: any
  response: any
  db: any
}

export async function injectMiddleware() {
  server.express.use(cp)
  server.express.use(auth)
  server.express.use((request: Request, response: any, next: any) => {
    schema.addToContext((req) => {
      return { request: request, response: response }
    })
    next()
  })
  // await addCookies(request.req, request.res)
  // await authorization(request.req, request.res)
}
