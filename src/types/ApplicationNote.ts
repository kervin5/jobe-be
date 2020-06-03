import { objectType } from '@nexus/schema'

export const ApplicationNote = objectType({
  name: 'ApplicationNote',
  definition(t) {
    t.model.id()
    t.model.application()
    t.model.user()
    t.model.createdAt()
    t.model.type()
    t.model.content()
  },
})
