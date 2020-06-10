import cookieParser from 'cookie-parser'
import cors from 'cors'
import auth from './middleware/auth'
import { server, schema } from 'nexus'

const cp = cookieParser()

export interface Context {
  request: any
  response: any
  db: any
}

export async function injectMiddleware() {
  server.express.use(
    cors({
      origin: [
        'https://www.myexactjobs.com/',
        'http://localhost:3000',
        'https://myexactjobs.herokuapp.com',
        'https://www.myexactjobs.com',
        'https://jobboard-fe-next.now.sh',
      ],
      credentials: true,
      optionsSuccessStatus: 200,
      methods: ['POST', 'GET'],
    }),
  )
  server.express.use(cp)
  server.express.use(auth)
  server.express.use((request: Request, response: any, next: any) => {
    schema.addToContext((req) => {
      return { request: request, response: response }
    })
    next()
  })
}
