import { core } from 'nexus/components/schema'
import { schema } from 'nexus'
import { can } from '../../permissions/auth'

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
        orderBy: { name: 'asc' },
      })
    },
  })

  t.list.field('branchesByUser', {
    type: 'Branch',
    args: {
      where: schema.arg({ type: 'BranchWhereInput', nullable: true }),
    },
    resolve: async (parent, args, ctx) => {
      const user = await ctx.db.user.findOne({
        where: { id: ctx.request.user.id },
        include: {
          branch: { include: { company: true } },
          otherBranches: true,
        },
      })

      // if (await can('READ', 'COMPANY', ctx)) {
      //   return ctx.db.branch.findMany({
      //     where: { company: { id: user?.branch?.company.id } },
      //     orderBy: { name: 'asc' },
      //   })
      // }

      const branchesId = [
        user?.branch?.id,
        user?.otherBranches.map((br) => br.id),
      ].flat(2)

      return ctx.db.branch.findMany({
        where: { id: { in: branchesId as string[] } },
        orderBy: { name: 'asc' },
      })
    },
  })
}
