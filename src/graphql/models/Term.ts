import { schema } from 'nexus'

schema.objectType({
  name: 'Term',
  definition(t) {
    t.string('id')
    t.string('label')
    t.string('type')
  },
})
