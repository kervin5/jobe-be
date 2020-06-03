import { ObjectDefinitionBlock } from '@nexus/schema/dist/definitions/objectType'
import { stringArg } from '@nexus/schema'

export default (t: ObjectDefinitionBlock<'Mutation'>) => {
  //TODO: reimplement crontask procedure
  t.string('schedule', {
    nullable: true,
    args: {
      id: stringArg({ required: true }),
    },
    resolve: async (parent, args, ctx) => {
      return ''
    },
  })

  t.string('unschedule', {
    nullable: true,
    args: {
      id: stringArg({ required: true }),
    },
    resolve: async (parent, args, ctx) => {
      return ''
    },
  })
}
