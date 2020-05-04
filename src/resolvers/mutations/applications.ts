import { ObjectDefinitionBlock } from '@nexus/schema/dist/definitions/objectType'
import { stringArg } from '@nexus/schema'

export default (t: ObjectDefinitionBlock<'Mutation'>) => {
  t.field('createApplicationnew', {
    type: 'Application',
    nullable: true,
    args: { job: ar },
    resolve: async (parent, args, ctx) => {
      return ctx.prisma.application.create({
        data: {
          ...args,
        },
      })
    },
  })
}
