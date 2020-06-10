import { schema } from 'nexus'

schema.objectType({
  name: 'Perk',
  definition(t) {
    t.model.id()
    t.model.name()
    t.model.jobs({ filtering: true })
    t.model.author()
  },
})
