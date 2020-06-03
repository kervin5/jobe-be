import { PrismaClient } from '@prisma/client'
import cookieParser from 'cookie-parser'
import auth from './middleware/auth'

const prisma = new PrismaClient()

const cp = cookieParser()
const addCookies = (req: any, res: any) =>
  new Promise((resolve) => {
    cp(req, res, resolve)
  })
const authorization = (req: any, res: any) =>
  new Promise((resolve) => {
    auth(req, res, resolve)
  })

export interface Context {
  prisma: PrismaClient
  request: any
  response: any
}

export async function createContext(request: any): Promise<Context> {
  await addCookies(request.req, request.res)
  await authorization(request.req, request.res)
  return { prisma, request: request.req, response: request.res }
}
