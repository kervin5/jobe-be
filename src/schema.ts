//TODO: maybe delete
// import { nexusPrismaPlugin } from 'nexus-prisma'
// import { makeSchema } from '@nexus/schema'
// import * as types from './types'

// export const schema = makeSchema({
//   types,
//   plugins: [
//     nexusPrismaPlugin({
//       outputs: {
//         typegen: __dirname + '/generated/index.ts',
//       },
//     }),
//   ],
//   outputs: {
//     schema: __dirname + '/../schema.graphql',
//     typegen: __dirname + '/generated/nexus.ts',
//   },
//   typegenAutoConfig: {
//     sources: [
//       {
//         source: '@prisma/client',
//         alias: 'client',
//       },
//       {
//         source: require.resolve('./context'),
//         alias: 'Context',
//       },
//     ],
//     contextType: 'Context.Context',
//   },
// })
