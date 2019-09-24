const request = require("./request");

const searchBoundary = async (locationName, ctx, radius = 10) => {
  //Latitude Longitude degree to miles calculation times the radius
  const radiusDistance = (1 / 68.703) * (radius || 10);
  const LOCATION_QUERY = `{
        id
        name
        boundary
        longitude
        latitude
    }`;

  //Gets data of location if it exists in database
  const locations = await ctx.db.query.locations(
    { where: { name: locationName } },
    LOCATION_QUERY
  );

  let [location] = locations || null;

  if (location) {
    [leftEdge, bottomEdge, rightEdge, topEdge] = location.boundary;
  } else {
    const foundLocation = (await request(
      "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
        locationName +
        ".json" +
        "?access_token=pk.eyJ1Ijoia3Zhc3F1ZXppdCIsImEiOiJjandzNWtjcjUwMHh2NDJxa2toeWJ6N2FlIn0.Qa-IM4Em_QMvC2QWlMvieQ" +
        "&types=country,region,postcode,place",
      {},
      "GET"
    )).features[0];
    // console.log(foundLocation);

    location = await ctx.db.mutation.createLocation(
      {
        data: {
          name: locationName,
          longitude: foundLocation.center[1],
          latitude: foundLocation.center[0],
          boundary: { set: foundLocation.bbox }
        }
      },
      LOCATION_QUERY
    );

    [leftEdge, bottomEdge, rightEdge, topEdge] = location.boundary;
  }

  return [
    leftEdge - radiusDistance,
    bottomEdge - radiusDistance,
    rightEdge + radiusDistance,
    topEdge + radiusDistance
  ];
};

module.exports = { searchBoundary };
