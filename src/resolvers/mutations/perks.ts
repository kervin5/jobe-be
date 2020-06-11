import { schema } from 'nexus'

export default (t) => {
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
