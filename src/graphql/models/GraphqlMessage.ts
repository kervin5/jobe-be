import { schema } from 'nexus'

schema.objectType({
  name: 'GraphqMessage',
  definition(t) {
    t.string('type')
    t.string('message')
    t.int('code', { resolve: () => 200 })
  },
})
