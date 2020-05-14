import { objectType } from '@nexus/schema'

export const Branch = objectType({
  name: 'Branch',
  definition(t) {
    t.model.id()
    t.model.name()
    t.model.company()
    t.model.users()
    t.model.jobs()
    t.model.description()
  },
})
