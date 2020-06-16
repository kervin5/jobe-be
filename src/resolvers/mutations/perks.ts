import { schema } from 'nexus'
import { core } from 'nexus/components/schema'

export default (t: core.ObjectDefinitionBlock<'Mutation'>) => {
  t.field('createPerk', {
    type: 'Perk',
    nullable: true,
    args: {
      name: schema.stringArg({ required: true }),
    },
    resolve: async (parent, args, ctx) => {
      return ctx.db.perk.create({
        data: {
          name: args.name,
          author: { connect: { id: ctx.request.user.id } },
        },
      })
    },
  })

  t.field('createManyPerks', {
    type: 'Perk',
    list: true,
    args: {
      perks: schema.stringArg({ list: true, required: true }),
    },
    resolve: async (parent, args, ctx) => {
      const createManyPerks = async function* generateSequence(
        perks: string[],
      ) {
        for (let i = 0; i < perks.length; i++) {
          // yay, can use await!
          await ctx.db.perk.create({
            data: {
              name: perks[i],
              author: { connect: { id: ctx.request.user.id } },
            },
          })

          yield perks[i]
        }
      }

      let generator = createManyPerks(args.perks)
      for await (let value of generator) {
        console.log(value) // 1, then 2, then 3, then 4, then 5
      }

      return ctx.db.perk.findMany()
    },
  })
}
