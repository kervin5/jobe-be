import { ObjectDefinitionBlock } from '@nexus/schema/dist/definitions/objectType'
import { stringArg } from '@nexus/schema'

export default (t: ObjectDefinitionBlock<'Mutation'>) => {
  t.field('createCategory', {
    type: 'Category',
    nullable: true,
    args: {
      name: stringArg({ required: true }),
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
