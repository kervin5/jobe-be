import cookieParser from 'cookie-parser'
import auth from './middleware/auth'
// import { ContextContributor } from 'nexus/dist/runtime/schema/schema'
import { server } from 'nexus'

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
}

export async function injectMiddleware() {
  server.express.use(cp)
  server.express.use(auth)
  // await addCookies(request.req, request.res)
  // await authorization(request.req, request.res)
  // return { request: request.req, response: request.res }
}
