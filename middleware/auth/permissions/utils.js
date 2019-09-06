function getUserEmail(ctx) {
  const Authorization = ctx.request.get('Authorization')
  if (Authorization) {
    const email = Authorization.replace('Bearer ', '')
    return email
  }
  return null
}

module.exports = getUserEmail;