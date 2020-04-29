import { objectType } from '@nexus/schema'

export const File = objectType({
  name: 'File',
  definition(t) {
    t.model.id()
  },
})
