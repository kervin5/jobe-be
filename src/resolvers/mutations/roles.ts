import { ObjectDefinitionBlock } from '@nexus/schema/dist/definitions/objectType'
import { stringArg, arg, idArg } from '@nexus/schema'

export default (t: ObjectDefinitionBlock<'Mutation'>) => {
  t.field('createRole', {
    type: 'Role',
    nullable: true,
    args: {
      name: stringArg({ required: true }),
      permissions: arg({
        type: 'RolePermissionsInputType',
        list: true,
        required: true,
      }),
    },
    resolve: async (parent, args, ctx) => {
      return await ctx.prisma.role.create({
        data: {
          name: args.name,
          permissions: {
            create: args.permissions?.map((permission: IRolePermission) => ({
              object: permission.object,
              actions: { set: permission.actions },
            })),
          },
        },
      })
    },
  })

  t.field('updateRole', {
    type: 'Role',
    nullable: true,
    args: {
      id: idArg({ required: true }),
      name: stringArg(),
      permissions: arg({ type: 'RolePermissionsInputType', list: true }),
    },
    resolve: async (parent, args, ctx) => {
      const role = await ctx.prisma.role.findOne({
        where: { id: args.id },
        include: { permissions: true },
      })

      return ctx.prisma.role.update({
        data: {
          name: args.name || role?.name,
          permissions: {
            delete: role?.permissions.map((permission) => ({
              id: permission.id,
            })),
            create: args.permissions.map((permission: IRolePermission) => ({
              object: permission.object,
              actions: { set: permission.actions },
            })),
            // create: args.permissions
          },
        },
        where: { id: args.id },
      })
    },
  })
}

interface IRolePermission {
  object: string
  actions: string[]
}
