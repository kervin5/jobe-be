import { searchBoundary } from '../../utils/location'
//const { forwardTo } = require("prisma-binding");
import { ObjectDefinitionBlock } from '@nexus/schema/dist/definitions/objectType'
import { stringArg, arg, intArg } from '@nexus/schema'
import { UserAccessFilter } from './users'
import { can } from '../../permissions/auth'

export default (t: ObjectDefinitionBlock<'Query'>) => {
  t.field('application', {
    type: 'Application',
    nullable: true,
    args: {
      radius: intArg({ nullable: true, default: 5 }),
      location: stringArg({ nullable: true }),
      query: stringArg(),
      where: arg({ type: 'ApplicationWhereInput' }),
      perPage: intArg({ nullable: true }),
      skip: intArg({ nullable: true }),
    },
    resolve: async (parent, args, ctx) => {
      const application = await ctx.prisma.application.findOne({
        where: { id: args.where?.id ?? '' },
      })

      if (application?.status === 'NEW') {
        await ctx.prisma.application.update({
          where: { id: application.id },
          data: { status: 'VIEWED' },
        })

        await ctx.prisma.applicationNote.create({
          data: {
            content: 'VIEWED',
            user: { connect: { id: ctx.request.user.id } },
            application: { connect: { id: args.where.id } },
            type: 'STATUS',
          },
        })
      }
      return null
    },
  })
}
