import { core } from 'nexus/components/schema'
import { schema } from 'nexus'
export default (t: core.ObjectDefinitionBlock<'Query'>) => {
  t.field('perks', {
    type: 'Perk',
    list: true,
    args: {
      where: schema.arg({ type: 'PerkWhereInput', nullable: true }),
      take: schema.intArg(),
      skip: schema.intArg(),
      orderBy: schema.arg({ type: 'PerkOrderByInput' }),
    },
    resolve: async (parent, args, ctx) => {
      return ctx.db.perk.findMany({
        ...(args.take ? { take: args.take, skip: args.skip } : {}),
        ...(args.orderBy ? { orderBy: args.orderBy } : {}),
      })
    },
  })
  t.int('perksConnection', {
    args: {
      where: schema.arg({ type: 'PerkWhereInput' }),
    },
    resolve: async (parent, args, ctx) => {
      return ctx.db.perk.count()
    },
  })
}
