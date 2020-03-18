const { GraphQLServer } = require("graphql-yoga");
const Mutation = require("../src/resolvers/Mutation");
const Query = require("../src/resolvers/Query");
const db = require("./db");
const permissions = require("../src/middleware/auth/permissions");
// const { sentry } = require("graphql-middleware-sentry");

// const sentryMiddleware = sentry({
//   config: {
//     dsn: process.env.SENTRY_DSN,
//     environment: process.env.NODE_ENV
//   },
//   withScope: (scope, error, context) => {
//     scope.setUser({
//       user: context.request.user || undefined
//     });
//     scope.setExtra("body", context.request.body);
//     scope.setExtra("origin", context.request.headers.origin);
//     scope.setExtra("user-agent", context.request.headers["user-agent"]);
//   }
// });

// Create the GraphQL Yoga Server

function createServer() {
  return new GraphQLServer({
    typeDefs: "src/schema.graphql",
    middlewares: [permissions],
    resolvers: {
      Mutation,
      Query,
      User: {
        eEmpact: async (parent, args, ctx) => {
          const res = await fetch("https://api.exactstaff.com/status", {
            method: "POST",
            body: JSON.stringify({ email: parent.email }),
            headers: {
              "Content-Type": "application/json"
              // 'Content-Type': 'application/x-www-form-urlencoded',
            }
          });
          const { user } = await res.json();

          return { ...user };
        }
      }
    },
    resolverValidationOptions: {
      requireResolversForResolveType: false
    },
    context: req => ({ ...req, db })
  });
}

module.exports = createServer;
