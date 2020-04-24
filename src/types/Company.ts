import { objectType } from '@nexus/schema'

export const Company = objectType({
  name: 'Company',
  definition(t) {
    t.model.id()
    t.model.name()
    t.model.branches()
  },
})
