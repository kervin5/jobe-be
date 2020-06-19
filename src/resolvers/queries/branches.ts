import { core } from 'nexus/components/schema'
import { schema } from 'nexus'

export default (t: core.ObjectDefinitionBlock<'Query'>) => {
  t.list.field('branches', {
    type: 'Branch',
    args: {
      where: schema.arg({ type: 'BranchWhereInput' }),
    },
    resolve: async (parent, args, ctx) => {
      const user = await ctx.db.user.findOne({
        where: { id: ctx.request.user.id },
        include: { branch: { include: { company: true } } },
      })

      return ctx.db.branch.findMany({
        where: { company: { id: user?.branch?.company.id } },
      })
    },
  })
}
