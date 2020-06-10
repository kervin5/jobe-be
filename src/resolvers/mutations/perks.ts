import { ObjectDefinitionBlock } from '@nexus/schema/dist/definitions/objectType'
import { stringArg } from '@nexus/schema'

export default (t: ObjectDefinitionBlock<'Mutation'>) => {
  t.field('createPerk', {
    type: 'Perk',
    nullable: true,
    args: {
      name: stringArg({ required: true }),
    },
    resolve: async (parent, args, ctx) => {
      return ctx.db.perk.create({
        data: {
          name: args.name,
          author: { connect: { id: ctx.request.user.id } },
        },
      })
    },
  })
}
