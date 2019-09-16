const { rule, and, or, not } = require('graphql-shield');
const getUserEmail = require('./utils');

const isGrocer = rule()(async (parent, args, ctx, info) => {
  const email = getUserEmail(ctx);
  // Is there a Grocer with such email in our database (Prisma)?
  return ctx.db.exists.User({ email });
})

const isCustomer = rule()(
  async (parent, args, ctx, info) => {
    const email = getUserEmail(ctx);
    // Is there a Customer with such email in our database (Prisma)?
    return ctx.db.exists.User({ email });
  },
)

const can = (action, object) => rule()(async (parent, args, ctx, info)=>{
 
  try {
  const user = await ctx.db.query.user({where: {id:  ctx.request.user.id}},`{
    id
    email
    role {
      id
      permissions {
        id
        object
        actions
      }
    }
  }`);

  return user.role.permissions.some( permission => (permission.object === object && permission.actions.includes(action) ) );
  }
  
  catch(ex) {
  
    return false;
  }
});

const isAuthenticated = or(isCustomer, isGrocer);

module.exports = {isGrocer, isCustomer, isAuthenticated, can};