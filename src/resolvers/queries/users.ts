import { ObjectDefinitionBlock } from '@nexus/schema/dist/definitions/objectType'
import { stringArg, arg, intArg } from '@nexus/schema'
import { can } from '../../permissions/auth'

export interface UserAccessFilter {
  branch?: object
  company?: object
  author?: object
}

export default (t: ObjectDefinitionBlock<'Query'>) => {
  t.field('user', {
    type: 'User',
    args: {
      where: arg({ type: 'UserWhereInput' }),
    },
    resolve: async (parent, args, ctx) => {
      return ctx.prisma.user.findOne({ where: { id: args.where?.id } })
    },
  })
  //Fetch all users
  t.list.field('users', {
    type: 'User',
    args: {
      where: arg({ type: 'UserWhereInput' }),
      skip: intArg(),
      after: stringArg(),
      before: stringArg(),
      first: intArg(),
      last: intArg(),
    },
    resolve: async (parent, args, ctx) => {
      const requesterData = await ctx.prisma.user.findOne({
        where: { id: ctx.request.user.id },
        include: { branch: { include: { company: true } } },
      })

      let usersFilter: UserAccessFilter = {
        branch: { id: requesterData?.branch?.id },
      }

      if (await can('READ', 'COMPANY', ctx)) {
        usersFilter = {
          branch: { company: { id: requesterData?.branch?.company.id } },
        }
      }

      if (await can('READ', 'USER', ctx)) {
        usersFilter = {}
      }

      return ctx.prisma.user.findMany({
        ...args,
        where: { ...args.where, ...usersFilter },
      })
    },
  })
}
