const { shield, and, or } = require("graphql-shield");
const rules = require("./rules");

const permissions = shield({
  Query: {
    protectedJobs: rules.can("CREATE", "JOB"),
    protectedJobsConnection: rules.can("CREATE", "JOB"),
    users: rules.can("READ", "USER"),
    usersConnection: rules.can("READ", "USER"),
    candidates: or(rules.can("READ", "BRANCH"), rules.can("READ", "COMPANY")),
    candidatesConnection: or(
      rules.can("READ", "BRANCH"),
      rules.can("READ", "COMPANY")
    ),
    protectedJobsConnection: or(
      rules.can("READ", "BRANCH"),
      rules.can("READ", "COMPANY")
    )
  },
  Mutation: {
    createUser: rules.can("CREATE", "USER"),
    createJob: rules.can("CREATE", "JOB"),
    updateJob: rules.can("UPDATE", "JOB"),
    deleteJob: rules.can("DELETE", "JOB"),
    createRole: rules.can("CREATE", "ROLE"),
    updateRole: rules.can("UPDATE", "ROLE"),
    createLocation: rules.can("CREATE", "LOCATION"),
    createCategory: rules.can("CREATE", "CATEGORY"),
    createSkill: rules.can("CREATE", "CATEGORY"),
    addFavorite: rules.can("CREATE", "FAVORITE"),
    deleteFavorite: rules.can("DELETE", "FAVORITE"),
    signFileUpload: rules.can("CREATE", "RESUME"),
    createResume: rules.can("CREATE", "RESUME"),
    createCompany: rules.can("CREATE", "COMPANY")
  }
  //   Mutation: {
  //     addItemToBasket: rules.isCustomer,
  //     removeItemFromBasket: rules.isCustomer,
  //     addProduct: rules.isGrocer,
  //     removeProduct: rules.isGrocer,
  //   }//,
  //   Job: {
  //     author: rules.isAuthenticated,
  //   },
});

module.exports = permissions;
