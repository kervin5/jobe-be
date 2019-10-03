const { GraphQLServer } = require("graphql-yoga");
const Mutation = require("../src/resolvers/Mutation");
const Query = require("../src/resolvers/Query");
const db = require("./db");
const permissions = require("../src/middleware/auth/permissions");

// Create the GraphQL Yoga Server

function createServer() {
  return new GraphQLServer({
    typeDefs: "src/schema.graphql",
    middlewares: [permissions],
    resolvers: {
      Mutation,
      Query
    },
    resolverValidationOptions: {
      requireResolversForResolveType: false
    },
    context: req => ({ ...req, db })
  });
}

module.exports = createServer;
