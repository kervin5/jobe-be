import { core } from 'nexus/components/schema'

export default (t: core.ObjectDefinitionBlock<'Query'>) => {
  t.list.field('statsApplicationsByBranch', {
    type: 'StatisticCountByBranch',
    resolve: async (parent, args, ctx) => {
      const result = await ctx.db
        .$queryRaw(`SELECT count(*) as count, "Branch".name, "Application".status FROM "${process.env.DATABASE_SCHEMA}"."Application"
      JOIN "${process.env.DATABASE_SCHEMA}"."Job" ON "Application".job = "Job".id
      JOIN "${process.env.DATABASE_SCHEMA}"."Branch" ON "Job".branch = "Branch".id
      GROUP BY "Branch".name, "Application".status ORDER BY count DESC`)
      return result
    },
  })

  t.list.field('statsJobsByBranch', {
    type: 'StatisticCountByBranch',
    resolve: async (parent, args, ctx) => {
      const result = await ctx.db
        .$queryRaw(`SELECT count(*) as count,"Branch".name, "Job".status FROM "${process.env.DATABASE_SCHEMA}"."Job"
        JOIN "${process.env.DATABASE_SCHEMA}"."Branch" on "Job".branch = "Branch".id
        GROUP BY "Branch".name, "Job".status ORDER BY count DESC`)
      return result
    },
  })

  t.list.field('statsYTDJobsAndApplications', {
    type: 'StatisticCountWithLabel',
    resolve: async (parent, args, ctx) => {
      const result = await ctx.db
        .$queryRaw(`SELECT count(*) as count, source2.count as count2, TO_CHAR("createdAt",'Month') as label,
        EXTRACT(MONTH FROM "createdAt") as orderKey
        FROM "${process.env.DATABASE_SCHEMA}"."Application"
        JOIN (SELECT count(*) as count, TO_CHAR(j."createdAt",'Month') as l, EXTRACT(MONTH FROM j."createdAt") as ok
        FROM "${process.env.DATABASE_SCHEMA}"."Job" as j
        WHERE j."createdAt" >= date_trunc('year', now())
        GROUP BY l, ok
        ORDER BY ok) as source2 ON source2.l = TO_CHAR("createdAt",'Month')
        WHERE "createdAt" >= date_trunc('year', now())
        GROUP BY label, orderKey, source2.count
        ORDER BY orderKey
        `)
      return result
    },
  })

  t.list.field('statsPowerUsers', {
    type: 'StatisticCountWithLabel',
    resolve: async (parent, args, ctx) => {
      const result = await ctx.db
        .$queryRaw(`SELECT ( count(DISTINCT "ApplicationNote".application) + jobsPosted.count) as count , "User".name as label, "Branch".name as label2 FROM "${process.env.DATABASE_SCHEMA}"."ApplicationNote"
        JOIN "${process.env.DATABASE_SCHEMA}"."User" ON "ApplicationNote"."user" = "User".id
        JOIN (SELECT count(*) as count, u.id
        FROM "${process.env.DATABASE_SCHEMA}"."Job" as j
        JOIN "${process.env.DATABASE_SCHEMA}"."User" as u ON j.author = u.id
        WHERE j."createdAt" >= date_trunc('month', now())
        GROUP BY u.id
        ) as jobsPosted ON jobsPosted.id = "User".id
        JOIN "${process.env.DATABASE_SCHEMA}"."Branch" ON "User".branch = "Branch".id
        WHERE status = 'ACTIVE' AND "${process.env.DATABASE_SCHEMA}"."ApplicationNote"."createdAt" >= date_trunc('month', now())
        GROUP BY label2,"User".name, jobsPosted.count order by count DESC
        `)
      return result
    },
  })
}
