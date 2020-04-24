import { objectType } from '@nexus/schema'

export const Role = objectType({
  name: 'Role',
  definition(t) {
    t.model.id()
    t.model.name()
    t.model.permissions()
  },
})
