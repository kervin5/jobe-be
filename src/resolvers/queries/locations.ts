import { ObjectDefinitionBlock } from '@nexus/schema/dist/definitions/objectType'
import request from '../../utils/request'
import { stringArg } from '@nexus/schema'

interface IMapboxLocation {
  id: string
  place_name: string
}

export default (t: ObjectDefinitionBlock<'Query'>) => {
  t.crud.location()
  t.crud.locations()
  t.field('mapBoxLocations', {
    type: 'MapboxLocation',
    args: {
      query: stringArg(),
    },
    resolve: async (parent, args, ctx) => {
      try {
        if (args.query === '') return []
        const mapBoxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${args.query}.json?access_token=${process.env.MAPBOX_TOKEN}`
        const locations = await request(mapBoxUrl, null, 'GET')
        const result = locations.features.map((location: IMapboxLocation) => ({
          id: location.id,
          name: location.place_name,
        }))
        return result
      } catch (ex) {
        console.log(ex)
        return []
      }
    },
  })
}
