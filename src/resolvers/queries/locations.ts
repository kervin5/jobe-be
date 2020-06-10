import request from '../../utils/request'
import { schema } from 'nexus'

interface IMapboxLocation {
  id: string
  place_name: string
}

export default (t) => {
  t.crud.location()
  t.crud.locations()
  t.list.field('mapBoxLocations', {
    type: 'MapboxLocation',
    args: {
      query: schema.stringArg(),
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
