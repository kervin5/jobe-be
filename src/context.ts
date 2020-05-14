import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface Context {
  prisma: PrismaClient
  request: any
  response: any
}

export function createContext(request: any): Context {
  return { prisma, request: request.req, response: request.res }
}
