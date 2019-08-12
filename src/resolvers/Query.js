const { forwardTo } = require('prisma-binding');

const Query = {
    // async locations(parent, args, ctx, info) {
    //     const locations = await ctx.db.query.locations();
    //     return locations;
    // }
    locations: forwardTo('db'),
    location: forwardTo('db'),
    categories: forwardTo('db'),
    category: forwardTo('db'),
    skills: forwardTo('db'),
    skill: forwardTo('db')
};

module.exports = Query;