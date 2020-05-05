import { objectType } from '@nexus/schema'

export const Skill = objectType({
  name: 'Skill',
  definition(t) {
    t.model.id()
    t.model.name()
    t.model.jobs({ filtering: true })
    t.model.users()
    t.model.resumes({ filtering: true })
  },
})
