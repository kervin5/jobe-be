import { schema } from 'nexus'
import { core } from 'nexus/components/schema'

export default (t: core.ObjectDefinitionBlock<'<Mutation'>) => {
  t.field('createApplicationNote', {
    type: 'ApplicationNote',
    nullable: true,
    args: {
      id: schema.idArg({ required: true }),
      content: schema.stringArg({ required: true }),
    },
    resolve: async (parent, args, ctx, info) => {
      try {
        const applicationNote = await ctx.db.applicationNote.create({
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
