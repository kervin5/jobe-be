import { ObjectDefinitionBlock } from '@nexus/schema/dist/definitions/objectType'
import { stringArg, arg, idArg, floatArg } from '@nexus/schema'

export default (t: ObjectDefinitionBlock<'Mutation'>) => {
  t.field('createLocation', {
    type: 'Location',
    nullable: true,
    args: {
      name: stringArg({ required: true }),
      latitude: floatArg({ required: true }),
      longitude: floatArg({ required: true }),
      boundary: floatArg({ list: true, required: true }),
    },
    resolve: async (parent, args, ctx, info) => {
      return ctx.prisma.location.create({
        data: {
          ...args,
          boundary: { set: args.boundary },
        },
      })
    },
  })
}

interface IRolePermission {
  object: string
  actions: string[]
}
