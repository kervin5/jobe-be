import { schema } from 'nexus'
import { core } from 'nexus/components/schema'

export default (t: core.ObjectDefinitionBlock<'Mutation'>) => {
  t.field('createRole', {
    type: 'Role',
    nullable: true,
    args: {
      name: schema.stringArg({ required: true }),
      permissions: schema.arg({
        type: 'RolePermissionsInputType',
        list: true,
        required: true,
      }),
    },
    resolve: async (parent, args, ctx) => {
      const rolePermissions = args.permissions?.map(
        (permission: IRolePermission) => ({
          object: permission.object,
          actions: { set: permission.actions },
        }),
      )

      return await ctx.db.role.create({
        data: {
          name: args.name,
          permissions: {
            //@ts-ignore
            create: rolePermissions,
          },
        },
      })
    },
  })

  t.field('updateRole', {
    type: 'Role',
    nullable: true,
    args: {
      id: schema.idArg({ required: true }),
      name: schema.stringArg(),
      permissions: schema.arg({ type: 'RolePermissionsInputType', list: true }),
    },
    resolve: async (parent, args, ctx) => {
      const role = await ctx.db.role.findOne({
        where: { id: args.id },
        include: { permissions: true },
      })

      return ctx.db.role.update({
        data: {
          name: args.name || role?.name,
          permissions: {
            delete: role?.permissions.map((permission) => ({
              id: permission.id,
            })),
            //@ts-ignore
            create: args.permissions?.map((permission: IRolePermission) => ({
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
  actions?: string[] | null
}
