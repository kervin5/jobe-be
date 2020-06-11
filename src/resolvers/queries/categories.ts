import { schema } from 'nexus'
import { core } from 'nexus/components/schema'

export default (t: core.ObjectDefinitionBlock<'Query'>) => {
  t.crud.category()
  t.list.field('categories', {
    type: 'Category',
    args: {
      where: schema.arg({ type: 'CategoryWhereInput' }),
      take: schema.intArg(),
    },
    resolve: async (parent, args, ctx) => {
      return ctx.db.category.findMany({
        where: args.where,
        ...(args.take ? { take: args.take } : {}),
      })
    },
  })
}
