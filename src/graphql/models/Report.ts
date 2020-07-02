import { schema } from 'nexus'

schema.objectType({
  name: 'ReportApplicationByBranch',
  definition(t) {
    t.string('name'), t.string('status'), t.float('applications')
  },
})
