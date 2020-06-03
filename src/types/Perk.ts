import { objectType } from '@nexus/schema'

export const Perk = objectType({
  name: 'Perk',
  definition(t) {
    t.model.id()
    t.model.name()
    t.model.jobs({ filtering: true })
    t.model.author()
  },
})
