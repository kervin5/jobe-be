import { verify, Secret } from 'jsonwebtoken'
import { Context } from '../context'
import { Request } from 'express'

export interface Token {
  id: string
}

export interface IUserCan {
  action: string
  object: string
}

export async function can(action: string, object: string, ctx: Context) {
  try {
    const user = await ctx.db.user.findOne({
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

export function getUserId(req: Request) {
  const token = getUserToken(req)
  if (token) {
    const decoded = verify(token, process.env.APP_SECRET as Secret) as Token
    return decoded
  }
}

export function getUserToken(req: Request) {
  const authorization =
    req.cookies?.token ||
    (req.headers.Authorization
      ? req.headers.Authorization
      : req.headers.authorization || null)

  if (authorization) {
    const token = authorization.replace('Bearer ', '')
    return token
  } else {
    return null
  }
}
