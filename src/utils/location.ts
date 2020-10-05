import request from './request'
import { Context } from '../../types/context'

export async function searchBoundary(
  locationName: string,
  ctx: Context,
  radius: number = 10,
) {
  //Latitude Longitude degree to miles calculation times the radius
  const radiusDistance = (1 / 68.703) * (radius || 10)

  //Gets data of location if it exists in database
  const locations = await ctx.db.location.findMany({
    where: { name: locationName },
  })

  let [location] = locations || [null]

  if (location) {
    let [leftEdge, bottomEdge, rightEdge, topEdge] = [0, 0, 0, 0]

    if (location.boundary.every((edge: number) => edge === 0)) {
      const foundLocation = await fetchLocation(locationName)

      if (!foundLocation) {
        return [leftEdge, bottomEdge, rightEdge, topEdge]
      }

      location = await ctx.db.location.update({
        data: {
          name: locationName,
          longitude: foundLocation.center[0],
          latitude: foundLocation.center[1],
          boundary: { set: foundLocation.bbox },
        },
        where: {
          id: location.id,
        },
      })
    }

    ;[leftEdge, bottomEdge, rightEdge, topEdge] = location.boundary
    return [
      leftEdge - radiusDistance,
      bottomEdge - radiusDistance,
      rightEdge + radiusDistance,
      topEdge + radiusDistance,
    ]
  } else {
    const foundLocation = await fetchLocation(locationName)
    let [leftEdge, bottomEdge, rightEdge, topEdge] = [0, 0, 0, 0]
    // console.log(foundLocation);

    if (!foundLocation) {
      return [leftEdge, bottomEdge, rightEdge, topEdge]
    }

    location = await ctx.db.location.create({
      data: {
        name: locationName,
        longitude: foundLocation.center[0],
        latitude: foundLocation.center[1],
        boundary: { set: foundLocation.bbox },
      },
    })
    ;[leftEdge, bottomEdge, rightEdge, topEdge] = location.boundary
    return [
      leftEdge - radiusDistance,
      bottomEdge - radiusDistance,
      rightEdge + radiusDistance,
      topEdge + radiusDistance,
    ]
  }
}

export async function fetchLocation(locationName: string) {
  return (
    await request(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/
      ${locationName}.json?access_token=${process.env.MAPBOX_TOKEN}&types=country,region,postcode,place`,
      {},
      'GET',
    )
  ).features[0]
}

module.exports = { searchBoundary, fetchLocation }
