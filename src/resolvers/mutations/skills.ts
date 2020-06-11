import { schema } from 'nexus'

export default (t) => {
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
