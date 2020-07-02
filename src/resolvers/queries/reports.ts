import { core } from 'nexus/components/schema'

export default (t: core.ObjectDefinitionBlock<'Query'>) => {
  t.list.field('applicationsByBranch', {
    type: 'ReportApplicationByBranch',
    resolve: async (parent, args, ctx) => {
      const result = await ctx.db
        .queryRaw(`SELECT count(*) as applications, "Branch".name, "Application".status FROM dcchv2o3d4942b."myexactjobs-prisma-prod$prod"."Application"

      JOIN "myexactjobs-prisma-prod$prod"."Job" ON "Application".job = "Job".id
      JOIN "myexactjobs-prisma-prod$prod"."Branch" ON "Job".branch = "Branch".id
      
      GROUP BY "Branch".name, "Application".status ORDER BY applications DESC`)
      return result
    },
  })
}
