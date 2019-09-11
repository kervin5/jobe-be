const { forwardTo } = require('prisma-binding');
const jwt = require('jsonwebtoken');
const {can} = require('../../middleware/auth/permissions/utils');

const Query = {
    // async locations(parent, args, ctx, info) {
    //     const locations = await ctx.db.query.locations();
    //     return locations;
    // }
    jobs: forwardTo('db'), 
    job: forwardTo('db'),
    async jobsConnection(parent, args, ctx, info) {
        if (!userExists(ctx)) {
            return null;
        }

        const user = await ctx.db.query.user({where: {id: ctx.request.user.id }},`{
            id
            role {
                permissions (where: { object: "BRANCH" }) {
                    id
                    object
                    actions
                }
            }
            branch {
                id
            }
        }`);

        return await ctx.db.query.jobsConnection({where: { branch: {id: user.branch.id } , ...(user.role.permissions.length > 0 && user.role.permissions[0].actions.includes("READ") ? {} :{author: {id: user.id}}) }}, info)
    },
    users: forwardTo('db'),
    async me(parent, args, ctx, info) {
        if (!userExists(ctx)) {
            return null;
        }

        const user =  await ctx.db.query.user({where: { id: ctx.request.user.id }},info);

        return await can("READ","BRANCH",ctx)  ?  user : {...user, branch: null} ;
    },
    locations: forwardTo('db'),
    location: forwardTo('db'),
    categories: forwardTo('db'),
    category: forwardTo('db'),
    skills: forwardTo('db'),
    async authorize(parent, args, ctx, info) {
        return userExists(ctx);
        // put the userId onto the req for future requests to access
    },
    async applicationsConnection(parent, args, ctx, info) {
        if (!userExists(ctx)) {
            return null;
        }

        return await ctx.db.query.applicationsConnection({where: { job: { author: {id: ctx.request.user.id}} }},info);
    }
};

const userExists = (ctx) => {
   return !!(typeof ctx.request.user !== "undefined" && ctx.request.user.id);
}

module.exports = Query;