import { ObjectDefinitionBlock } from '@nexus/schema/dist/definitions/objectType'
import { arg, intArg } from '@nexus/schema'

export default (t: ObjectDefinitionBlock<'Query'>) => {
  t.crud.category()
  t.list.field('categories', {
    type: 'Category',
    args: { where: arg({ type: 'CategoryWhereInput' }), take: intArg() },
    resolve: async (parent, args, ctx) => {
      return ctx.prisma.category.findMany({
        where: args.where,
        ...(args.take ? { take: args.take } : {}),
      })
    },
  })
}
