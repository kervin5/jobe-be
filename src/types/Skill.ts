import { objectType } from 'nexus'

export const Skill = objectType({
  name: 'Skill',
  definition(t) {
    t.model.id()
    t.model.name()
    t.model.jobs()
  },
})
