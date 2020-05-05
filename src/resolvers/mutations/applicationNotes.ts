import { ObjectDefinitionBlock } from '@nexus/schema/dist/definitions/objectType'
import { stringArg, arg, idArg, floatArg } from '@nexus/schema'

export default (t: ObjectDefinitionBlock<'Mutation'>) => {
  t.field('createApplicationNote', {
    type: 'ApplicationNote',
    nullable: true,
    args: {
      id: idArg({ required: true }),
      content: stringArg({ required: true }),
    },
    resolve: async (parent, args, ctx, info) => {
      try {
        const applicationNote = await ctx.prisma.applicationNote.create({
          data: {
            content: args.content,
            user: { connect: { id: ctx.request.user.id } },
            application: { connect: { id: args.id } },
            type: 'NOTE',
          },
        })
        return applicationNote
      } catch (error) {
        return null
      }
    },
  })
}
