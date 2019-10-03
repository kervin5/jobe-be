const { forwardTo } = require("prisma-binding");

const roles = forwardTo("db");

module.exports = { queries: { roles } };
