// GENERATED NEXUS START MODULE
// Run framework initialization side-effects
// Also, import the app for later use
import app from "nexus";
// Last resort error handling
process.once('uncaughtException', error => {
    app.log.fatal('uncaughtException', { error: error });
    process.exit(1);
});
process.once('unhandledRejection', error => {
    app.log.fatal('unhandledRejection', { error: error });
    process.exit(1);
});
// Import the user's schema modules
import './src/context';
import './src/graphql/Mutation';
import './src/graphql/Query';
import './src/graphql/models/Application';
import './src/graphql/models/ApplicationNote';
import './src/graphql/models/AuthPayload';
import './src/graphql/models/Branch';
import './src/graphql/models/Category';
import './src/graphql/models/Company';
import './src/graphql/models/Favorite';
import './src/graphql/models/File';
import './src/graphql/models/Filter';
import './src/graphql/models/Job';
import './src/graphql/models/JobCronTask';
import './src/graphql/models/Location';
import './src/graphql/models/Perk';
import './src/graphql/models/Permission';
import './src/graphql/models/Resume';
import './src/graphql/models/Role';
import './src/graphql/models/Skill';
import './src/graphql/models/Term';
import './src/graphql/models/User';
import './src/resolvers/mutations/applicationNotes';
import './src/resolvers/mutations/applications';
import './src/resolvers/mutations/categories';
import './src/resolvers/mutations/companies';
import './src/resolvers/mutations/favorites';
import './src/resolvers/mutations/files';
import './src/resolvers/mutations/jobCronTasks';
import './src/resolvers/mutations/jobs';
import './src/resolvers/mutations/locations';
import './src/resolvers/mutations/perks';
import './src/resolvers/mutations/resumes';
import './src/resolvers/mutations/roles';
import './src/resolvers/mutations/skills';
import './src/resolvers/mutations/users';
import './src/resolvers/queries/applications';
import './src/resolvers/queries/branches';
import './src/resolvers/queries/categories';
import './src/resolvers/queries/files';
import './src/resolvers/queries/jobs';
import './src/resolvers/queries/locations';
// Import the user's app module
require("./app");
app.assemble();
app.start();
