import { schema } from 'nexus'

schema.objectType({
  name: 'Resume',
  definition(t) {
    t.model.id()
    t.model.user()
    t.model.file()
    t.model.title()
    t.model.createdAt()
    t.model.updatedAt()
    t.model.skills({ filtering: true })
  },
})
