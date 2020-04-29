import { objectType } from '@nexus/schema'

export const Location = objectType({
  name: 'Location',
  definition(t) {
    t.model.id()
    t.model.name()
    t.model.jobs()
    t.model.latitude()
    t.model.longitude()
    t.model.boundary()
  },
})
