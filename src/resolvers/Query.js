const { forwardTo } = require('prisma-binding');
const jwt = require('jsonwebtoken');

const Query = {
    // async locations(parent, args, ctx, info) {
    //     const locations = await ctx.db.query.locations();
    //     return locations;
    // }
    jobs: forwardTo('db'),
    job: forwardTo('db'),
    users: forwardTo('db'),
    locations: forwardTo('db'),
    location: forwardTo('db'),
    categories: forwardTo('db'),
    category: forwardTo('db'),
    skills: forwardTo('db'),
    async authorize(parent, args, ctx, info) {
        retun (typeof ctx.request.user !== "undefined" && ctx.request.user.userId);
        // put the userId onto the req for future requests to access
    }
};

module.exports = Query;