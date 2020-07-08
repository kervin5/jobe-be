import { schema } from 'nexus'

schema.objectType({
  name: 'StatisticCountByBranch',
  definition(t) {
    t.string('name'), t.string('status'), t.float('count')
  },
})

schema.objectType({
  name: 'StatisticCountWithLabel',
  definition(t) {
    t.string('label'),
      t.string('label2', { nullable: true }),
      t.float('count', { nullable: true }),
      t.float('count2', { nullable: true })
  },
})
