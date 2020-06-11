import { schema } from 'nexus'
import { core } from 'nexus/components/schema'
export default (t: core.ObjectDefinitionBlock<'Mutation'>) => {
  //TODO: reimplement crontask procedure
  t.string('schedule', {
    nullable: true,
    args: {
      id: schema.stringArg({ required: true }),
    },
    resolve: async (parent, args, ctx) => {
      return ''
    },
  })

  t.string('unschedule', {
    nullable: true,
    args: {
      id: schema.stringArg({ required: true }),
    },
    resolve: async (parent, args, ctx) => {
      return ''
    },
  })
}
