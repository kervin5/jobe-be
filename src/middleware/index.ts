import cookieParser from 'cookie-parser'
import cors from 'cors'
import auth from './auth'
import { server } from 'nexus'

const cp = cookieParser()

export function injectMiddleware() {
  server.express.use(
    cors({
      origin: [process.env.FRONTEND_URL as string, 'http://localhost:3000'],
      credentials: true,
      optionsSuccessStatus: 200,
      methods: ['POST', 'GET'],
    }),
  )
  server.express.use(cp)
  server.express.use(auth)
}
