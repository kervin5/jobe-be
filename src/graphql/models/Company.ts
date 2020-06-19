import { schema } from 'nexus'

schema.objectType({
  name: 'Company',
  definition(t) {
    t.model.id()
    t.model.name()
    t.model.branches()
    t.model.location()
    t.model.description()
  },
})
