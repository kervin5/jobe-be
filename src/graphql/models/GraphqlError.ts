import { schema } from 'nexus'

schema.objectType({
  name: 'GraphqlError',
  definition(t) {
    t.string('type')
    t.string('message')
    t.int('code')
  },
})
