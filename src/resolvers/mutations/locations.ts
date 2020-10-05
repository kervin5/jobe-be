import { schema } from 'nexus'
import { core } from 'nexus/components/schema'
import request from '../../utils/request'

export default (t: core.ObjectDefinitionBlock<'Mutation'>) => {
  t.field('createLocation', {
    type: 'Location',
    nullable: true,
    args: {
      name: schema.stringArg({ required: true }),
      latitude: schema.floatArg({ required: true }),
      longitude: schema.floatArg({ required: true }),
      boundary: schema.floatArg({ list: true, required: true }),
    },
    resolve: async (parent, args, ctx, info) => {
      return ctx.db.location.create({
        data: {
          ...args,
          boundary: { set: args.boundary },
        },
      })
    },
  })

  // t.int('updateLocations', {
  //   resolve: async (parent, args, ctx, info) => {
  //     const locations = await ctx.db.location.findMany()

  //     async function* generateSequence() {
  //       for (let i = 0; i < locations.length; i++) {
  //         const location = locations[i]
  //         // yay, can use await!

  //         console.log({ location })
  //         const matches = await request(
  //           `https://api.mapbox.com/geocoding/v5/mapbox.places/
  //           ${location.name}.json?access_token=${process.env.MAPBOX_TOKEN}&types=country,region,postcode,place`,
  //           {},
  //           'GET',
  //         )

  //         try {
  //           const foundLocation = matches.features[0]

  //           //   console.log(foundLocation);
  //           const result = await ctx.db.location.update({
  //             where: { id: location.id },
  //             data: {
  //               boundary: { set: foundLocation.bbox },
  //               longitude: foundLocation.center[0],
  //               latitude: foundLocation.center[1],
  //             },
  //           })
  //           console.log('Done', i, result)
  //         } catch (e) {
  //           console.log('unable to locate')
  //         }

  //         yield i
  //       }
  //     }

  //     let generator = generateSequence()
  //     for await (let value of generator) {
  //       console.log(value) // 1, then 2, then 3, then 4, then 5
  //     }

  //     return locations.length
  //   },
  // })
}
