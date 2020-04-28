import { verify } from 'jsonwebtoken'
import { Context } from '../context'
import { Request, request } from 'express'

export async function can(action: string, object: string, ctx: Context) {
  try {
    const user = await ctx.prisma.user.findOne({
      where: { id: ctx.request.user.id },
      include: {
        role: { include: { permissions: true } },
      },
    })

    return user?.role.permissions.some(
      (permission) =>
        permission.object === object && permission.actions.includes(action),
    )
  } catch (ex) {
    console.log(ex)
    return false
  }
}

interface Token {
  id: string
}

export function getUserId(req: Request) {
  const token = getUserToken(req)

  if (token) {
    const decoded = verify(token, process.env.APP_SECRET ?? '') as Token
    return decoded
  }
}

export function getUserToken(req: Request) {
  const Authorization =
    req.cookies?.token ||
    (req.headers.authorization ? req.headers.authorization : null)

  if (Authorization) {
    const token = Authorization.replace('Bearer ', '')
    return token
  } else {
    return null
  }
}
