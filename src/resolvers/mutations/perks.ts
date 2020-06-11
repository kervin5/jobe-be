import { schema } from 'nexus'
import { core } from 'nexus/components/schema'

export default (t: core.ObjectDefinitionBlock<'Mutation'>) => {
  t.field('createPerk', {
    type: 'Perk',
    nullable: true,
    args: {
      name: schema.stringArg({ required: true }),
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
