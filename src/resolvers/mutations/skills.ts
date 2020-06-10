import { ObjectDefinitionBlock } from '@nexus/schema/dist/definitions/objectType'
import { stringArg } from '@nexus/schema'

export default (t: ObjectDefinitionBlock<'Mutation'>) => {
  t.field('createSkill', {
    type: 'Skill',
    nullable: true,
    args: {
      name: stringArg({ required: true }),
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
