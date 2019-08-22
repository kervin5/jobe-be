const { forwardTo } = require('prisma-binding');
const jwt = require('jsonwebtoken');

const Query = {
    // async locations(parent, args, ctx, info) {
    //     const locations = await ctx.db.query.locations();
    //     return locations;
    // }
    jobs: forwardTo('db'), 
    job: forwardTo('db'),
    async jobsConnectionPerUser(parent, args, ctx, info) {
        if (!ctx.request.user.userId) {
            return null;
        }
        return await ctx.db.query.jobsConnection({where: { author: {id: ctx.request.user.userId} }}, info)
    },
    users: forwardTo('db'),
    async me(parent, args, ctx, info) {
        if (!ctx.request.user.userId) {
            return null;
        }
        return await ctx.db.query.user({where: { id: ctx.request.user.userId },},info);
    },
    locations: forwardTo('db'),
    location: forwardTo('db'),
    categories: forwardTo('db'),
    category: forwardTo('db'),
    skills: forwardTo('db'),
    async authorize(parent, args, ctx, info) {
        return !!(typeof ctx.request.user !== "undefined" && ctx.request.user.userId);
        // put the userId onto the req for future requests to access
    },
    async applicationsConnection(parent, args, ctx, info) {
        if (!ctx.request.user.userId) {
            return null;
        }

        args.where.user = {id: ctx.request.user.userId};

        return await ctx.db.query.applicationsConnection(args,info);
    }
};

module.exports = Query;