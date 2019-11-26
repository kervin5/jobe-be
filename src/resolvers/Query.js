const { forwardTo } = require("prisma-binding");
const request = require("../lib/request");

const { sign_s3_read } = require("../lib/aws");
const { shuffleArray } = require("../lib/utils");

//////////////////////////
const Jobs = require("../controllers/jobs");
const Users = require("../controllers/users");
const Roles = require("../controllers/roles");
const Applications = require("../controllers/applications");

const Query = {
  ...Jobs.queries,
  ...Users.queries,
  ...Roles.queries,
  ...Applications.queries,
  async branches(parent, args, ctx, info) {
    if (!userExists(ctx)) {
      return null;
    }
    const user = await ctx.db.query.user(
      { where: { id: ctx.request.user.id } },
      `{ 
            id
            branch {
                id
                company {
                    id
                }
            }
         }`
    );

    const branches = await ctx.db.query.branches({
      where: { company: { id: user.branch.company.id } }
    });

    return branches;
  },
  locations: forwardTo("db"),
  location: forwardTo("db"),
  categories: forwardTo("db"),
  category: forwardTo("db"),
  skills: forwardTo("db"),
  async getSignedFileUrl(parent, args, ctx, info) {
    if (!userExists(ctx)) {
      return null;
    }
    const [file] = await ctx.db.query.files({
      where: { path_ends_with: args.AWSUrl }
    });

    if (file) {
      return await sign_s3_read(file.path);
    }
    return null;
  },
  async popularTerms(parent, args, ctx, info) {
    let categories = await ctx.db.query.categories(
      { where: { jobs_some: { status: "POSTED" } } },
      `{
            id
            name
            jobs {
                id
            }
        }`
    );

    let locations = await ctx.db.query.locations(
      { where: { jobs_some: { status: "POSTED" } } },
      `{
              id
              name
              jobs {
                  id
              }
          }`
    );

    categories.sort((a, b) => (a.jobs.length > b.jobs.length ? -1 : 1));
    locations.sort((a, b) => (a.jobs.length > b.jobs.length ? -1 : 1));

    const terms = [
      ...categories
        .map(category => ({
          label: category.name,
          type: "category",
          id: category.id
        }))
        .slice(0, 4),
      ...locations
        .map(location => ({
          label: location.name,
          type: "location",
          id: location.id
        }))
        .slice(0, 5)
    ];

    shuffleArray(terms);

    return terms;
  },
  async image(parent, args, ctx, info) {
    try {
      const result = await request(
        `https://api.unsplash.com/photos/random?client_id=10ef2049e8dbf02f4198df4e287771e0b9f3a9635917dab105b9940004d87e1e&query=${
          args.query
        }&orientation=landscape`,
        null,
        "GET"
      );
      return result.urls.regular;
    } catch (ex) {
      return "";
    }
  },
  async mapboxLocations(parent, args, ctx, info) {
    try {
      if (args.query === "") return [];
      const mapBoxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${
        args.query
      }.json?access_token=${process.env.MAPBOX_TOKEN}`;
      const locations = await request(mapBoxUrl, null, "GET");
      const result = locations.features.map(location => ({
        id: location.id,
        name: location.place_name
      }));
      return result;
    } catch (ex) {
      console.log(ex);
      return [];
    }
  }
};

const userExists = ctx => {
  return !!(typeof ctx.request.user !== "undefined" && ctx.request.user.id);
};

module.exports = Query;
