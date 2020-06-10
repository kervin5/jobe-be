import request from './request';
export async function searchBoundary(locationName, ctx, radius = 10) {
    //Latitude Longitude degree to miles calculation times the radius
    const radiusDistance = (1 / 68.703) * (radius || 10);
    //Gets data of location if it exists in database
    const locations = await ctx.db.location.findMany({
        where: { name: locationName },
    });
    let [location] = locations || [null];
    if (location) {
        let [leftEdge, bottomEdge, rightEdge, topEdge] = [0, 0, 0, 0];
        if (location.boundary.every((edge) => edge === 0)) {
            const foundLocation = await fetchLocation(locationName);
            if (!foundLocation) {
                return [leftEdge, bottomEdge, rightEdge, topEdge];
            }
            location = await ctx.db.location.update({
                data: {
                    name: locationName,
                    longitude: foundLocation.center[1],
                    latitude: foundLocation.center[0],
                    boundary: { set: foundLocation.bbox },
                },
                where: {
                    id: location.id,
                },
            });
        }
        ;
        [leftEdge, bottomEdge, rightEdge, topEdge] = location.boundary;
        return [
            leftEdge - radiusDistance,
            bottomEdge - radiusDistance,
            rightEdge + radiusDistance,
            topEdge + radiusDistance,
        ];
    }
    else {
        const foundLocation = await fetchLocation(locationName);
        let [leftEdge, bottomEdge, rightEdge, topEdge] = [0, 0, 0, 0];
        // console.log(foundLocation);
        if (!foundLocation) {
            return [leftEdge, bottomEdge, rightEdge, topEdge];
        }
        location = await ctx.db.location.create({
            data: {
                name: locationName,
                longitude: foundLocation.center[1],
                latitude: foundLocation.center[0],
                boundary: { set: foundLocation.bbox },
            },
        });
        [leftEdge, bottomEdge, rightEdge, topEdge] = location.boundary;
        return [
            leftEdge - radiusDistance,
            bottomEdge - radiusDistance,
            rightEdge + radiusDistance,
            topEdge + radiusDistance,
        ];
    }
}
export async function fetchLocation(locationName) {
    return (await request(`https://api.mapbox.com/geocoding/v5/mapbox.places/
      ${locationName}.json?access_token=${process.env.MAPBOX_TOKEN}&types=country,region,postcode,place`, {}, 'GET')).features[0];
}
module.exports = { searchBoundary, fetchLocation };
// async updateBoundaries(parent, args, ctx, info) {
//   const locations = (await ctx.db.query.locations({},`{id name boundary latitude longitude}`)).filter(location => {
//     const [left, bottom, right, top] =  location.boundary;
//         return (left === 0 && bottom === 0 && right === 0 && top === 0);
//     });
//     locations.forEach(async (location, index) => {
//             setTimeout(async ()=>{
//             const matches = await request(
//                 "https://api.mapbox.com/geocoding/v5/mapbox.places/" + location.longitude + "," + location.latitude +
//                   ".json" +
//                   "?access_token=pk.eyJ1Ijoia3Zhc3F1ZXppdCIsImEiOiJjandzNWtjcjUwMHh2NDJxa2toeWJ6N2FlIn0.Qa-IM4Em_QMvC2QWlMvieQ" +
//                   "&types=country,region,postcode,place",
//                 {},
//                 "GET"
//             );
//             const foundLocation = matches.features[0];
//             console.log(foundLocation.bbox);
//             //   console.log(foundLocation);
//               const result = await ctx.db.mutation.updateLocation({where: { id: location.id }, data: { boundary: { set: foundLocation.bbox } }},`{id boundary name}`);
//               console.log("Done", index, result);
//             }, 3*1000*index);
//     });
//     console.log(locations);
//   return locations.length;
// },
