import { Context } from '../context'

export async function can(action: string, object: string, ctx: Context) {
  try {
    const user = await ctx.prisma.user.findOne({
      where: { id: ctx.request.user.id },
      include: { role: { include: { permissions: true } } },
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
