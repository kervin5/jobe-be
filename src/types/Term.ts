import { objectType } from '@nexus/schema'

export const Term = objectType({
  name: 'Term',
  definition(t) {
    t.string('id')
    t.string('token')
    t.string('type')
  },
})
