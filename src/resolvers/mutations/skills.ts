import { schema } from 'nexus'
import { core } from 'nexus/components/schema'

export default (t: core.ObjectDefinitionBlock<'Mutation'>) => {
  t.field('createSkill', {
    type: 'Skill',
    nullable: true,
    args: {
      name: schema.stringArg({ required: true }),
    },
    resolve: async (parent, args, ctx) => {
      return ctx.db.skill.create({
        data: {
          ...args,
        },
      })
    },
  })
}
