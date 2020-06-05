import { objectType } from '@nexus/schema'

export const Favorite = objectType({
  name: 'Favorite',
  definition(t) {
    t.model.id()
    t.model.user()
    t.model.job()
  },
})
