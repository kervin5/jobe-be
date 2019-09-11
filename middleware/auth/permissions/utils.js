function getUserEmail(ctx) {
  const Authorization = ctx.request.get('Authorization')
  if (Authorization) {
    const email = Authorization.replace('Bearer ', '')
    return email
  }
  return null
}


async function can(action, object,ctx) {
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
      console.log(ex);
      return false;
    }
}
module.exports = {getUserEmail, can};