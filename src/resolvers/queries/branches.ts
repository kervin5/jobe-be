import { ObjectDefinitionBlock } from '@nexus/schema/dist/definitions/objectType'
import { arg } from '@nexus/schema'

export default (t: ObjectDefinitionBlock<'Query'>) => {
  t.list.field('branches', {
    type: 'Branch',
    args: {
      where: arg({ type: 'BranchWhereInput' }),
    },
    resolve: async (parent, args, ctx) => {
      const user = await ctx.prisma.user.findOne({
        where: { id: ctx.request.user.id },
        include: { branch: { include: { company: true } } },
      })

      return ctx.prisma.branch.findMany({
        where: { company: { id: user?.branch?.company.id } },
      })
    },
  })
}
