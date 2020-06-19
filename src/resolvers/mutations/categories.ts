import { schema } from 'nexus'
import { core } from 'nexus/components/schema'

export default (t: core.ObjectDefinitionBlock<'Mutation'>) => {
  t.field('createCategory', {
    type: 'Category',
    nullable: true,
    args: {
      name: schema.stringArg({ required: true }),
    },
    resolve: async (parent, args, ctx) => {
      return ctx.db.category.create({
        data: {
          ...args,
        },
      })
    },
  })
}
