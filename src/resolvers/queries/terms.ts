import { core } from 'nexus/components/schema'
import { shuffleArray } from '../../utils/functions'

export default (t: core.ObjectDefinitionBlock<'Query'>) => {
  t.list.field('popularTerms', {
    type: 'Term',
    resolve: async (parent, args, ctx) => {
      // console.log(
      //   await ctx.db.category.findMany({
      //     where: { jobs: { some: { status: { equals: 'POSTED' } } } },
      //   }),
      // )
      // return []
      let categories = await ctx.db.category.findMany({
        where: { jobs: { some: { status: 'POSTED' } } },
        include: { jobs: true },
      })

      let locations = await ctx.db.location.findMany({
        where: { jobs: { some: { status: 'POSTED' } } },
        include: { jobs: true },
      })

      categories.sort((a, b) => (a.jobs.length > b.jobs.length ? -1 : 1))
      locations.sort((a, b) => (a.jobs.length > b.jobs.length ? -1 : 1))

      const terms = [
        ...categories
          .map((category) => ({
            label: category.name,
            type: 'category',
            id: category.id,
          }))
          .slice(0, 4),
        ...locations
          .map((location) => ({
            label: location.name,
            type: 'location',
            id: location.id,
          }))
          .slice(0, 5),
      ]

      shuffleArray(terms)
      return terms
    },
  })
}
