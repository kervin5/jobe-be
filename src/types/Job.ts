import { objectType } from 'nexus'

export const Job = objectType({
  name: 'Job',
  definition(t) {
    t.model.id()
    t.model.title()
  },
})
