import { schema } from 'nexus'

export default (t) => {
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
