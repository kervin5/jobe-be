import { schema } from 'nexus'

export default (t) => {
  t.field('createCompany', {
    type: 'Company',
    nullable: true,
    args: {
      name: schema.stringArg({ required: true }),
      description: schema.stringArg({ required: true }),
    },
    resolve: async (parent, args, ctx) => {
      const company = await ctx.db.company.create({
        data: {
          ...args,
        },
      })
      return company
    },
  })
}
