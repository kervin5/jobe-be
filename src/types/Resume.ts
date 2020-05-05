import { objectType } from '@nexus/schema'

export const Resume = objectType({
  name: 'Resume',
  definition(t) {
    t.model.id()
    t.model.user()
    t.model.file()
  },
})
