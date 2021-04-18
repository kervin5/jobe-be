import dotenv from 'dotenv'

dotenv.config()

import { fetchLocation, reverseFetchLocation } from "./src/utils/location"
import { PrismaClient , Location} from '@prisma/client'

const prisma = new PrismaClient();



(async()=>{
    const locations = await prisma.location.findMany({});

    async function* asyncGenerator(locs: Location[]) {
        let i = 0;
        while (i < locs.length) {
            const fetchedLocation:any = await fetchLocation(locs[i].name);
            console.log({fetchedLocation});
            const location = await prisma.location.update({
                data: {
                  longitude: fetchedLocation.center[0],
                  latitude: fetchedLocation.center[1],
                  boundary: {set: fetchedLocation.bbox}
                },
                where: {
                  id: locs[i].id,
                },
              });
              i++;
          yield location;
        }
      }

      for await (let location of asyncGenerator(locations)) {
        console.log(location);
      }
})()