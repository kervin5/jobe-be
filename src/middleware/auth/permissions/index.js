const { shield, and } = require("graphql-shield");
const rules = require("./rules");

const permissions = shield({
  Query: {
    protectedJobs: rules.isAuthenticated,
    candidates: rules.isAuthenticated
  },
  //   Mutation: {
  //     addItemToBasket: rules.isCustomer,
  //     removeItemFromBasket: rules.isCustomer,
  //     addProduct: rules.isGrocer,
  //     removeProduct: rules.isGrocer,
  //   }//,
  //   Job: {
  //     author: rules.isAuthenticated,
  //   },
  Mutation: {
    createJob: rules.can("CREATE", "JOB")
  }
});

module.exports = permissions;
