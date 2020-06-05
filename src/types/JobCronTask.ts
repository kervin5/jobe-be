import { objectType } from '@nexus/schema'

export const JobCronTask = objectType({
  name: 'JobCronTask',
  definition(t) {
    t.model.id()
  },
})
