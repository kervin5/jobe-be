import { ObjectDefinitionBlock } from '@nexus/schema/dist/definitions/objectType'
import { stringArg } from '@nexus/schema'

export default (t: ObjectDefinitionBlock<'Mutation'>) => {
  t.field('createCompany', {
    type: 'Company',
    nullable: true,
    args: {
      name: stringArg({ required: true }),
      description: stringArg({ required: true }),
    },
    resolve: async (parent, args, ctx) => {
      const company = await ctx.prisma.company.create({
        data: {
          ...args,
        },
      })
      return company
    },
  })
}
