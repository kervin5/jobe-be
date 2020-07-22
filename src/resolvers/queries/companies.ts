import { core } from 'nexus/components/schema'
import { schema } from 'nexus'

export default (t: core.ObjectDefinitionBlock<'Query'>) => {
  t.crud.company()
  t.list.field('companies', {
    type: 'Company',
    args: {
      where: schema.arg({ type: 'CompanyWhereInput', nullable: true }),
      take: schema.intArg({ nullable: true }),
      skip: schema.intArg({ nullable: true }),
    },
    resolve: async (parent, args, ctx) => {
      //@ts-ignore
      return ctx.db.company.findMany(args)
    },
  })
  t.int('companiesCount', {
    args: { where: schema.arg({ type: 'CompanyWhereInput', nullable: true }) },
    resolve: async (parent, args, ctx) => {
      //@ts-ignore
      return await ctx.db.company.count({ where: args.where })
    },
  })
}
