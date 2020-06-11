import { schema } from 'nexus'

export default (t) => {
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
