import { schema } from 'nexus'
import { core } from 'nexus/components/schema'

export default (t: core.ObjectDefinitionBlock<'Mutation'>) => {
  t.field('createLocation', {
    type: 'Location',
    nullable: true,
    args: {
      name: schema.stringArg({ required: true }),
      latitude: schema.floatArg({ required: true }),
      longitude: schema.floatArg({ required: true }),
      boundary: schema.floatArg({ list: true, required: true }),
    },
    resolve: async (parent, args, ctx, info) => {
      return ctx.db.location.create({
        data: {
          ...args,
          boundary: { set: args.boundary },
        },
      })
    },
  })
}
