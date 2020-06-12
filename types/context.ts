import { Request } from 'nexus/dist/runtime/schema/schema'

export interface Context {
  request: any
  response: any
  db: any
}

export interface ContextRequest extends Request {
  user?: any
}
