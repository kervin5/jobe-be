import * as prisma from '@prisma/client';
import { core } from '@nexus/schema';
import { GraphQLResolveInfo } from 'graphql';

// Types helpers
  type IsModelNameExistsInGraphQLTypes<
  ReturnType extends any
> = ReturnType extends core.GetGen<'objectNames'> ? true : false;

type NexusPrismaScalarOpts = {
  alias?: string;
};

type Pagination = {
  first?: boolean;
  last?: boolean;
  before?: boolean;
  after?: boolean;
  skip?: boolean;
};

type RootObjectTypes = Pick<
  core.GetGen<'rootTypes'>,
  core.GetGen<'objectNames'>
>;

/**
 * Determine if `B` is a subset (or equivalent to) of `A`.
*/
type IsSubset<A, B> = keyof A extends never
  ? false
  : B extends A
  ? true
  : false;

type OmitByValue<T, ValueType> = Pick<
  T,
  { [Key in keyof T]: T[Key] extends ValueType ? never : Key }[keyof T]
>;

type GetSubsetTypes<ModelName extends any> = keyof OmitByValue<
  {
    [P in keyof RootObjectTypes]: ModelName extends keyof ModelTypes
      ? IsSubset<RootObjectTypes[P], ModelTypes[ModelName]> extends true
        ? RootObjectTypes[P]
        : never
      : never;
  },
  never
>;

type SubsetTypes<ModelName extends any> = GetSubsetTypes<
  ModelName
> extends never
  ? `ERROR: No subset types are available. Please make sure that one of your GraphQL type is a subset of your t.model('<ModelName>')`
  : GetSubsetTypes<ModelName>;

type DynamicRequiredType<ReturnType extends any> = IsModelNameExistsInGraphQLTypes<
  ReturnType
> extends true
  ? { type?: SubsetTypes<ReturnType> }
  : { type: SubsetTypes<ReturnType> };

type GetNexusPrismaInput<
  ModelName extends any,
  MethodName extends any,
  InputName extends 'filtering' | 'ordering'
> = ModelName extends keyof NexusPrismaInputs
  ? MethodName extends keyof NexusPrismaInputs[ModelName]
    ? NexusPrismaInputs[ModelName][MethodName][InputName]
    : never
  : never;

/**
 *  Represents arguments required by Prisma Client JS that will
 *  be derived from a request's input (args, context, and info)
 *  and omitted from the GraphQL API. The object itself maps the
 *  names of these args to a function that takes an object representing
 *  the request's input and returns the value to pass to the prisma
 *  arg of the same name.
 */
export type LocalComputedInputs<MethodName extends any> = Record<
  string,
  (params: LocalMutationResolverParams<MethodName>) => unknown
>

export type GlobalComputedInputs = Record<
  string,
  (params: GlobalMutationResolverParams) => unknown
>

type BaseMutationResolverParams = {
  info: GraphQLResolveInfo
  ctx: Context
}

export type GlobalMutationResolverParams = BaseMutationResolverParams & {
  args: Record<string, any> & { data: unknown }
}

export type LocalMutationResolverParams<
  MethodName extends any
> = BaseMutationResolverParams & {
  args: MethodName extends keyof core.GetGen2<'argTypes', 'Mutation'>
    ? core.GetGen3<'argTypes', 'Mutation', MethodName>
    : any
}

export type Context = core.GetGen<'context'>

type NexusPrismaRelationOpts<
  ModelName extends any,
  MethodName extends any,
  ReturnType extends any
> = GetNexusPrismaInput<
  // If GetNexusPrismaInput returns never, it means there are no filtering/ordering args for it.
  ModelName,
  MethodName,
  'filtering'
> extends never
  ? {
      alias?: string;
      computedInputs?: LocalComputedInputs<MethodName>;
    } & DynamicRequiredType<ReturnType>
  : {
      alias?: string;
      computedInputs?: LocalComputedInputs<MethodName>;
      filtering?:
        | boolean
        | Partial<
            Record<
              GetNexusPrismaInput<ModelName, MethodName, 'filtering'>,
              boolean
            >
          >;
      ordering?:
        | boolean
        | Partial<
            Record<
              GetNexusPrismaInput<ModelName, MethodName, 'ordering'>,
              boolean
            >
          >;
      pagination?: boolean | Pagination;
    } & DynamicRequiredType<ReturnType>;

type IsScalar<TypeName extends any> = TypeName extends core.GetGen<'scalarNames'>
  ? true
  : false;

type IsObject<Name extends any> = Name extends core.GetGen<'objectNames'>
  ? true
  : false

type IsEnum<Name extends any> = Name extends core.GetGen<'enumNames'>
  ? true
  : false

type IsInputObject<Name extends any> = Name extends core.GetGen<'inputNames'>
  ? true
  : false

/**
 * The kind that a GraphQL type may be.
 */
type Kind = 'Enum' | 'Object' | 'Scalar' | 'InputObject'

/**
 * Helper to safely reference a Kind type. For example instead of the following
 * which would admit a typo:
 *
 * ```ts
 * type Foo = Bar extends 'scalar' ? ...
 * ```
 *
 * You can do this which guarantees a correct reference:
 *
 * ```ts
 * type Foo = Bar extends AKind<'Scalar'> ? ...
 * ```
 *
 */
type AKind<T extends Kind> = T

type GetKind<Name extends any> = IsEnum<Name> extends true
  ? 'Enum'
  : IsScalar<Name> extends true
  ? 'Scalar'
  : IsObject<Name> extends true
  ? 'Object'
  : IsInputObject<Name> extends true
  ? 'InputObject'
  // FIXME should be `never`, but GQL objects named differently
  // than backing type fall into this branch
  : 'Object'

type NexusPrismaFields<ModelName extends keyof NexusPrismaTypes> = {
  [MethodName in keyof NexusPrismaTypes[ModelName]]: NexusPrismaMethod<
    ModelName,
    MethodName,
    GetKind<NexusPrismaTypes[ModelName][MethodName]> // Is the return type a scalar?
  >;
};

type NexusPrismaMethod<
  ModelName extends keyof NexusPrismaTypes,
  MethodName extends keyof NexusPrismaTypes[ModelName],
  ThisKind extends Kind,
  ReturnType extends any = NexusPrismaTypes[ModelName][MethodName]
> =
  ThisKind extends AKind<'Enum'>
  ? () => NexusPrismaFields<ModelName>
  : ThisKind extends AKind<'Scalar'>
  ? (opts?: NexusPrismaScalarOpts) => NexusPrismaFields<ModelName> // Return optional scalar opts
  : IsModelNameExistsInGraphQLTypes<ReturnType> extends true // If model name has a mapped graphql types
  ? (
      opts?: NexusPrismaRelationOpts<ModelName, MethodName, ReturnType>
    ) => NexusPrismaFields<ModelName> // Then make opts optional
  : (
      opts: NexusPrismaRelationOpts<ModelName, MethodName, ReturnType>
    ) => NexusPrismaFields<ModelName>; // Else force use input the related graphql type -> { type: '...' }

type GetNexusPrismaMethod<
  TypeName extends string
> = TypeName extends keyof NexusPrismaMethods
  ? NexusPrismaMethods[TypeName]
  : <CustomTypeName extends keyof ModelTypes>(
      typeName: CustomTypeName
    ) => NexusPrismaMethods[CustomTypeName];

type GetNexusPrisma<
  TypeName extends string,
  ModelOrCrud extends 'model' | 'crud'
> = ModelOrCrud extends 'model'
  ? TypeName extends 'Mutation'
    ? never
    : TypeName extends 'Query'
    ? never
    : GetNexusPrismaMethod<TypeName>
  : ModelOrCrud extends 'crud'
  ? TypeName extends 'Mutation'
    ? GetNexusPrismaMethod<TypeName>
    : TypeName extends 'Query'
    ? GetNexusPrismaMethod<TypeName>
    : never
  : never;
  

// Generated
interface ModelTypes {
  Application: prisma.Application
  ApplicationNote: prisma.ApplicationNote
  Branch: prisma.Branch
  Category: prisma.Category
  Company: prisma.Company
  Favorite: prisma.Favorite
  File: prisma.File
  Job: prisma.Job
  JobCronTask: prisma.JobCronTask
  Location: prisma.Location
  Permission: prisma.Permission
  Resume: prisma.Resume
  Role: prisma.Role
  Skill: prisma.Skill
  User: prisma.User
}
  
interface NexusPrismaInputs {
  Query: {
    applications: {
  filtering: 'id' | 'createdAt' | 'updatedAt' | 'resumeId' | 'jobId' | 'status' | 'userId' | 'notes' | 'AND' | 'OR' | 'NOT' | 'resume' | 'job' | 'user'
  ordering: 'id' | 'createdAt' | 'updatedAt' | 'resumeId' | 'jobId' | 'status' | 'userId'
}
    applicationNotes: {
  filtering: 'id' | 'userId' | 'applicationId' | 'content' | 'createdAt' | 'updatedAt' | 'type' | 'AND' | 'OR' | 'NOT' | 'user' | 'application'
  ordering: 'id' | 'userId' | 'applicationId' | 'content' | 'createdAt' | 'updatedAt' | 'type'
}
    branches: {
  filtering: 'id' | 'name' | 'companyId' | 'locationId' | 'description' | 'jobs' | 'users' | 'AND' | 'OR' | 'NOT' | 'company' | 'location'
  ordering: 'id' | 'name' | 'companyId' | 'locationId' | 'description'
}
    categories: {
  filtering: 'id' | 'name' | 'jobs' | 'AND' | 'OR' | 'NOT'
  ordering: 'id' | 'name'
}
    companies: {
  filtering: 'id' | 'name' | 'description' | 'locationId' | 'branches' | 'AND' | 'OR' | 'NOT' | 'location'
  ordering: 'id' | 'name' | 'description' | 'locationId'
}
    favorites: {
  filtering: 'id' | 'userId' | 'jobId' | 'AND' | 'OR' | 'NOT' | 'user' | 'job'
  ordering: 'id' | 'userId' | 'jobId'
}
    files: {
  filtering: 'id' | 'createdAt' | 'updatedAt' | 'mimetype' | 'path' | 'Resume' | 'AND' | 'OR' | 'NOT'
  ordering: 'id' | 'createdAt' | 'updatedAt' | 'mimetype' | 'path'
}
    jobs: {
  filtering: 'id' | 'createdAt' | 'updatedAt' | 'title' | 'compensationType' | 'description' | 'disclaimer' | 'type' | 'maxCompensation' | 'minCompensation' | 'authorId' | 'locationId' | 'applications' | 'categories' | 'skills' | 'status' | 'favorites' | 'branchId' | 'cronTaskId' | 'AND' | 'OR' | 'NOT' | 'author' | 'location' | 'branch' | 'cronTask'
  ordering: 'id' | 'createdAt' | 'updatedAt' | 'title' | 'compensationType' | 'description' | 'disclaimer' | 'type' | 'maxCompensation' | 'minCompensation' | 'authorId' | 'locationId' | 'status' | 'branchId' | 'cronTaskId'
}
    jobCronTasks: {
  filtering: 'id' | 'lastRun' | 'nextRun' | 'objectId' | 'result' | 'AND' | 'OR' | 'NOT' | 'job'
  ordering: 'id' | 'lastRun' | 'nextRun' | 'objectId' | 'result'
}
    locations: {
  filtering: 'id' | 'name' | 'latitude' | 'longitude' | 'jobs' | 'users' | 'Branch' | 'Company' | 'AND' | 'OR' | 'NOT'
  ordering: 'id' | 'name' | 'latitude' | 'longitude'
}
    permissions: {
  filtering: 'id' | 'object' | 'roleId' | 'AND' | 'OR' | 'NOT' | 'role'
  ordering: 'id' | 'object' | 'roleId'
}
    resumes: {
  filtering: 'id' | 'title' | 'fileId' | 'userId' | 'createdAt' | 'updatedAt' | 'applications' | 'skills' | 'AND' | 'OR' | 'NOT' | 'file' | 'user'
  ordering: 'id' | 'title' | 'fileId' | 'userId' | 'createdAt' | 'updatedAt'
}
    roles: {
  filtering: 'id' | 'name' | 'permissions' | 'users' | 'AND' | 'OR' | 'NOT'
  ordering: 'id' | 'name'
}
    skills: {
  filtering: 'id' | 'name' | 'jobs' | 'resumes' | 'users' | 'AND' | 'OR' | 'NOT'
  ordering: 'id' | 'name'
}
    users: {
  filtering: 'id' | 'name' | 'email' | 'password' | 'createdAt' | 'updatedAt' | 'applications' | 'jobs' | 'locationId' | 'skills' | 'favorites' | 'roleId' | 'branchId' | 'resumes' | 'resetToken' | 'resetTokenExpiry' | 'status' | 'ApplicationNote' | 'AND' | 'OR' | 'NOT' | 'location' | 'role' | 'branch'
  ordering: 'id' | 'name' | 'email' | 'password' | 'createdAt' | 'updatedAt' | 'locationId' | 'roleId' | 'branchId' | 'resetToken' | 'resetTokenExpiry' | 'status'
}

  },
    Application: {
    notes: {
  filtering: 'id' | 'userId' | 'applicationId' | 'content' | 'createdAt' | 'updatedAt' | 'type' | 'AND' | 'OR' | 'NOT' | 'user' | 'application'
  ordering: 'id' | 'userId' | 'applicationId' | 'content' | 'createdAt' | 'updatedAt' | 'type'
}

  },  ApplicationNote: {


  },  Branch: {
    jobs: {
  filtering: 'id' | 'createdAt' | 'updatedAt' | 'title' | 'compensationType' | 'description' | 'disclaimer' | 'type' | 'maxCompensation' | 'minCompensation' | 'authorId' | 'locationId' | 'applications' | 'categories' | 'skills' | 'status' | 'favorites' | 'branchId' | 'cronTaskId' | 'AND' | 'OR' | 'NOT' | 'author' | 'location' | 'branch' | 'cronTask'
  ordering: 'id' | 'createdAt' | 'updatedAt' | 'title' | 'compensationType' | 'description' | 'disclaimer' | 'type' | 'maxCompensation' | 'minCompensation' | 'authorId' | 'locationId' | 'status' | 'branchId' | 'cronTaskId'
}
    users: {
  filtering: 'id' | 'name' | 'email' | 'password' | 'createdAt' | 'updatedAt' | 'applications' | 'jobs' | 'locationId' | 'skills' | 'favorites' | 'roleId' | 'branchId' | 'resumes' | 'resetToken' | 'resetTokenExpiry' | 'status' | 'ApplicationNote' | 'AND' | 'OR' | 'NOT' | 'location' | 'role' | 'branch'
  ordering: 'id' | 'name' | 'email' | 'password' | 'createdAt' | 'updatedAt' | 'locationId' | 'roleId' | 'branchId' | 'resetToken' | 'resetTokenExpiry' | 'status'
}

  },  Category: {
    jobs: {
  filtering: 'id' | 'createdAt' | 'updatedAt' | 'title' | 'compensationType' | 'description' | 'disclaimer' | 'type' | 'maxCompensation' | 'minCompensation' | 'authorId' | 'locationId' | 'applications' | 'categories' | 'skills' | 'status' | 'favorites' | 'branchId' | 'cronTaskId' | 'AND' | 'OR' | 'NOT' | 'author' | 'location' | 'branch' | 'cronTask'
  ordering: 'id' | 'createdAt' | 'updatedAt' | 'title' | 'compensationType' | 'description' | 'disclaimer' | 'type' | 'maxCompensation' | 'minCompensation' | 'authorId' | 'locationId' | 'status' | 'branchId' | 'cronTaskId'
}

  },  Company: {
    branches: {
  filtering: 'id' | 'name' | 'companyId' | 'locationId' | 'description' | 'jobs' | 'users' | 'AND' | 'OR' | 'NOT' | 'company' | 'location'
  ordering: 'id' | 'name' | 'companyId' | 'locationId' | 'description'
}

  },  Favorite: {


  },  File: {
    Resume: {
  filtering: 'id' | 'title' | 'fileId' | 'userId' | 'createdAt' | 'updatedAt' | 'applications' | 'skills' | 'AND' | 'OR' | 'NOT' | 'file' | 'user'
  ordering: 'id' | 'title' | 'fileId' | 'userId' | 'createdAt' | 'updatedAt'
}

  },  Job: {
    applications: {
  filtering: 'id' | 'createdAt' | 'updatedAt' | 'resumeId' | 'jobId' | 'status' | 'userId' | 'notes' | 'AND' | 'OR' | 'NOT' | 'resume' | 'job' | 'user'
  ordering: 'id' | 'createdAt' | 'updatedAt' | 'resumeId' | 'jobId' | 'status' | 'userId'
}
    categories: {
  filtering: 'id' | 'name' | 'jobs' | 'AND' | 'OR' | 'NOT'
  ordering: 'id' | 'name'
}
    skills: {
  filtering: 'id' | 'name' | 'jobs' | 'resumes' | 'users' | 'AND' | 'OR' | 'NOT'
  ordering: 'id' | 'name'
}
    favorites: {
  filtering: 'id' | 'userId' | 'jobId' | 'AND' | 'OR' | 'NOT' | 'user' | 'job'
  ordering: 'id' | 'userId' | 'jobId'
}

  },  JobCronTask: {


  },  Location: {
    jobs: {
  filtering: 'id' | 'createdAt' | 'updatedAt' | 'title' | 'compensationType' | 'description' | 'disclaimer' | 'type' | 'maxCompensation' | 'minCompensation' | 'authorId' | 'locationId' | 'applications' | 'categories' | 'skills' | 'status' | 'favorites' | 'branchId' | 'cronTaskId' | 'AND' | 'OR' | 'NOT' | 'author' | 'location' | 'branch' | 'cronTask'
  ordering: 'id' | 'createdAt' | 'updatedAt' | 'title' | 'compensationType' | 'description' | 'disclaimer' | 'type' | 'maxCompensation' | 'minCompensation' | 'authorId' | 'locationId' | 'status' | 'branchId' | 'cronTaskId'
}
    users: {
  filtering: 'id' | 'name' | 'email' | 'password' | 'createdAt' | 'updatedAt' | 'applications' | 'jobs' | 'locationId' | 'skills' | 'favorites' | 'roleId' | 'branchId' | 'resumes' | 'resetToken' | 'resetTokenExpiry' | 'status' | 'ApplicationNote' | 'AND' | 'OR' | 'NOT' | 'location' | 'role' | 'branch'
  ordering: 'id' | 'name' | 'email' | 'password' | 'createdAt' | 'updatedAt' | 'locationId' | 'roleId' | 'branchId' | 'resetToken' | 'resetTokenExpiry' | 'status'
}
    Branch: {
  filtering: 'id' | 'name' | 'companyId' | 'locationId' | 'description' | 'jobs' | 'users' | 'AND' | 'OR' | 'NOT' | 'company' | 'location'
  ordering: 'id' | 'name' | 'companyId' | 'locationId' | 'description'
}
    Company: {
  filtering: 'id' | 'name' | 'description' | 'locationId' | 'branches' | 'AND' | 'OR' | 'NOT' | 'location'
  ordering: 'id' | 'name' | 'description' | 'locationId'
}

  },  Permission: {


  },  Resume: {
    applications: {
  filtering: 'id' | 'createdAt' | 'updatedAt' | 'resumeId' | 'jobId' | 'status' | 'userId' | 'notes' | 'AND' | 'OR' | 'NOT' | 'resume' | 'job' | 'user'
  ordering: 'id' | 'createdAt' | 'updatedAt' | 'resumeId' | 'jobId' | 'status' | 'userId'
}
    skills: {
  filtering: 'id' | 'name' | 'jobs' | 'resumes' | 'users' | 'AND' | 'OR' | 'NOT'
  ordering: 'id' | 'name'
}

  },  Role: {
    permissions: {
  filtering: 'id' | 'object' | 'roleId' | 'AND' | 'OR' | 'NOT' | 'role'
  ordering: 'id' | 'object' | 'roleId'
}
    users: {
  filtering: 'id' | 'name' | 'email' | 'password' | 'createdAt' | 'updatedAt' | 'applications' | 'jobs' | 'locationId' | 'skills' | 'favorites' | 'roleId' | 'branchId' | 'resumes' | 'resetToken' | 'resetTokenExpiry' | 'status' | 'ApplicationNote' | 'AND' | 'OR' | 'NOT' | 'location' | 'role' | 'branch'
  ordering: 'id' | 'name' | 'email' | 'password' | 'createdAt' | 'updatedAt' | 'locationId' | 'roleId' | 'branchId' | 'resetToken' | 'resetTokenExpiry' | 'status'
}

  },  Skill: {
    jobs: {
  filtering: 'id' | 'createdAt' | 'updatedAt' | 'title' | 'compensationType' | 'description' | 'disclaimer' | 'type' | 'maxCompensation' | 'minCompensation' | 'authorId' | 'locationId' | 'applications' | 'categories' | 'skills' | 'status' | 'favorites' | 'branchId' | 'cronTaskId' | 'AND' | 'OR' | 'NOT' | 'author' | 'location' | 'branch' | 'cronTask'
  ordering: 'id' | 'createdAt' | 'updatedAt' | 'title' | 'compensationType' | 'description' | 'disclaimer' | 'type' | 'maxCompensation' | 'minCompensation' | 'authorId' | 'locationId' | 'status' | 'branchId' | 'cronTaskId'
}
    resumes: {
  filtering: 'id' | 'title' | 'fileId' | 'userId' | 'createdAt' | 'updatedAt' | 'applications' | 'skills' | 'AND' | 'OR' | 'NOT' | 'file' | 'user'
  ordering: 'id' | 'title' | 'fileId' | 'userId' | 'createdAt' | 'updatedAt'
}
    users: {
  filtering: 'id' | 'name' | 'email' | 'password' | 'createdAt' | 'updatedAt' | 'applications' | 'jobs' | 'locationId' | 'skills' | 'favorites' | 'roleId' | 'branchId' | 'resumes' | 'resetToken' | 'resetTokenExpiry' | 'status' | 'ApplicationNote' | 'AND' | 'OR' | 'NOT' | 'location' | 'role' | 'branch'
  ordering: 'id' | 'name' | 'email' | 'password' | 'createdAt' | 'updatedAt' | 'locationId' | 'roleId' | 'branchId' | 'resetToken' | 'resetTokenExpiry' | 'status'
}

  },  User: {
    applications: {
  filtering: 'id' | 'createdAt' | 'updatedAt' | 'resumeId' | 'jobId' | 'status' | 'userId' | 'notes' | 'AND' | 'OR' | 'NOT' | 'resume' | 'job' | 'user'
  ordering: 'id' | 'createdAt' | 'updatedAt' | 'resumeId' | 'jobId' | 'status' | 'userId'
}
    jobs: {
  filtering: 'id' | 'createdAt' | 'updatedAt' | 'title' | 'compensationType' | 'description' | 'disclaimer' | 'type' | 'maxCompensation' | 'minCompensation' | 'authorId' | 'locationId' | 'applications' | 'categories' | 'skills' | 'status' | 'favorites' | 'branchId' | 'cronTaskId' | 'AND' | 'OR' | 'NOT' | 'author' | 'location' | 'branch' | 'cronTask'
  ordering: 'id' | 'createdAt' | 'updatedAt' | 'title' | 'compensationType' | 'description' | 'disclaimer' | 'type' | 'maxCompensation' | 'minCompensation' | 'authorId' | 'locationId' | 'status' | 'branchId' | 'cronTaskId'
}
    skills: {
  filtering: 'id' | 'name' | 'jobs' | 'resumes' | 'users' | 'AND' | 'OR' | 'NOT'
  ordering: 'id' | 'name'
}
    favorites: {
  filtering: 'id' | 'userId' | 'jobId' | 'AND' | 'OR' | 'NOT' | 'user' | 'job'
  ordering: 'id' | 'userId' | 'jobId'
}
    resumes: {
  filtering: 'id' | 'title' | 'fileId' | 'userId' | 'createdAt' | 'updatedAt' | 'applications' | 'skills' | 'AND' | 'OR' | 'NOT' | 'file' | 'user'
  ordering: 'id' | 'title' | 'fileId' | 'userId' | 'createdAt' | 'updatedAt'
}
    ApplicationNote: {
  filtering: 'id' | 'userId' | 'applicationId' | 'content' | 'createdAt' | 'updatedAt' | 'type' | 'AND' | 'OR' | 'NOT' | 'user' | 'application'
  ordering: 'id' | 'userId' | 'applicationId' | 'content' | 'createdAt' | 'updatedAt' | 'type'
}

  }
}

interface NexusPrismaTypes {
  Query: {
    application: 'Application'
    applications: 'Application'
    applicationNote: 'ApplicationNote'
    applicationNotes: 'ApplicationNote'
    branch: 'Branch'
    branches: 'Branch'
    category: 'Category'
    categories: 'Category'
    company: 'Company'
    companies: 'Company'
    favorite: 'Favorite'
    favorites: 'Favorite'
    file: 'File'
    files: 'File'
    job: 'Job'
    jobs: 'Job'
    jobCronTask: 'JobCronTask'
    jobCronTasks: 'JobCronTask'
    location: 'Location'
    locations: 'Location'
    permission: 'Permission'
    permissions: 'Permission'
    resume: 'Resume'
    resumes: 'Resume'
    role: 'Role'
    roles: 'Role'
    skill: 'Skill'
    skills: 'Skill'
    user: 'User'
    users: 'User'

  },
  Mutation: {
    createOneApplication: 'Application'
    updateOneApplication: 'Application'
    updateManyApplication: 'BatchPayload'
    deleteOneApplication: 'Application'
    deleteManyApplication: 'BatchPayload'
    upsertOneApplication: 'Application'
    createOneApplicationNote: 'ApplicationNote'
    updateOneApplicationNote: 'ApplicationNote'
    updateManyApplicationNote: 'BatchPayload'
    deleteOneApplicationNote: 'ApplicationNote'
    deleteManyApplicationNote: 'BatchPayload'
    upsertOneApplicationNote: 'ApplicationNote'
    createOneBranch: 'Branch'
    updateOneBranch: 'Branch'
    updateManyBranch: 'BatchPayload'
    deleteOneBranch: 'Branch'
    deleteManyBranch: 'BatchPayload'
    upsertOneBranch: 'Branch'
    createOneCategory: 'Category'
    updateOneCategory: 'Category'
    updateManyCategory: 'BatchPayload'
    deleteOneCategory: 'Category'
    deleteManyCategory: 'BatchPayload'
    upsertOneCategory: 'Category'
    createOneCompany: 'Company'
    updateOneCompany: 'Company'
    updateManyCompany: 'BatchPayload'
    deleteOneCompany: 'Company'
    deleteManyCompany: 'BatchPayload'
    upsertOneCompany: 'Company'
    createOneFavorite: 'Favorite'
    updateOneFavorite: 'Favorite'
    updateManyFavorite: 'BatchPayload'
    deleteOneFavorite: 'Favorite'
    deleteManyFavorite: 'BatchPayload'
    upsertOneFavorite: 'Favorite'
    createOneFile: 'File'
    updateOneFile: 'File'
    updateManyFile: 'BatchPayload'
    deleteOneFile: 'File'
    deleteManyFile: 'BatchPayload'
    upsertOneFile: 'File'
    createOneJob: 'Job'
    updateOneJob: 'Job'
    updateManyJob: 'BatchPayload'
    deleteOneJob: 'Job'
    deleteManyJob: 'BatchPayload'
    upsertOneJob: 'Job'
    createOneJobCronTask: 'JobCronTask'
    updateOneJobCronTask: 'JobCronTask'
    updateManyJobCronTask: 'BatchPayload'
    deleteOneJobCronTask: 'JobCronTask'
    deleteManyJobCronTask: 'BatchPayload'
    upsertOneJobCronTask: 'JobCronTask'
    createOneLocation: 'Location'
    updateOneLocation: 'Location'
    updateManyLocation: 'BatchPayload'
    deleteOneLocation: 'Location'
    deleteManyLocation: 'BatchPayload'
    upsertOneLocation: 'Location'
    createOnePermission: 'Permission'
    updateOnePermission: 'Permission'
    updateManyPermission: 'BatchPayload'
    deleteOnePermission: 'Permission'
    deleteManyPermission: 'BatchPayload'
    upsertOnePermission: 'Permission'
    createOneResume: 'Resume'
    updateOneResume: 'Resume'
    updateManyResume: 'BatchPayload'
    deleteOneResume: 'Resume'
    deleteManyResume: 'BatchPayload'
    upsertOneResume: 'Resume'
    createOneRole: 'Role'
    updateOneRole: 'Role'
    updateManyRole: 'BatchPayload'
    deleteOneRole: 'Role'
    deleteManyRole: 'BatchPayload'
    upsertOneRole: 'Role'
    createOneSkill: 'Skill'
    updateOneSkill: 'Skill'
    updateManySkill: 'BatchPayload'
    deleteOneSkill: 'Skill'
    deleteManySkill: 'BatchPayload'
    upsertOneSkill: 'Skill'
    createOneUser: 'User'
    updateOneUser: 'User'
    updateManyUser: 'BatchPayload'
    deleteOneUser: 'User'
    deleteManyUser: 'BatchPayload'
    upsertOneUser: 'User'

  },
  Application: {
    id: 'String'
    createdAt: 'DateTime'
    updatedAt: 'DateTime'
    resumeId: 'String'
    resume: 'Resume'
    jobId: 'String'
    job: 'Job'
    status: 'ApplicationStatus'
    userId: 'String'
    user: 'User'
    notes: 'ApplicationNote'

},  ApplicationNote: {
    id: 'String'
    userId: 'String'
    user: 'User'
    applicationId: 'String'
    application: 'Application'
    content: 'String'
    createdAt: 'DateTime'
    updatedAt: 'DateTime'
    type: 'ApplicationNoteType'

},  Branch: {
    id: 'String'
    name: 'String'
    companyId: 'String'
    company: 'Company'
    locationId: 'String'
    location: 'Location'
    description: 'String'
    jobs: 'Job'
    users: 'User'

},  Category: {
    id: 'String'
    name: 'String'
    jobs: 'Job'

},  Company: {
    id: 'String'
    name: 'String'
    description: 'String'
    locationId: 'String'
    location: 'Location'
    branches: 'Branch'

},  Favorite: {
    id: 'String'
    userId: 'String'
    user: 'User'
    jobId: 'String'
    job: 'Job'

},  File: {
    id: 'String'
    createdAt: 'DateTime'
    updatedAt: 'DateTime'
    mimetype: 'String'
    path: 'String'
    Resume: 'Resume'

},  Job: {
    id: 'String'
    createdAt: 'DateTime'
    updatedAt: 'DateTime'
    title: 'String'
    compensationType: 'String'
    description: 'String'
    disclaimer: 'String'
    type: 'String'
    maxCompensation: 'Float'
    minCompensation: 'Float'
    authorId: 'String'
    author: 'User'
    locationId: 'String'
    location: 'Location'
    applications: 'Application'
    categories: 'Category'
    skills: 'Skill'
    status: 'JobStatus'
    favorites: 'Favorite'
    branchId: 'String'
    branch: 'Branch'
    cronTaskId: 'String'
    cronTask: 'JobCronTask'

},  JobCronTask: {
    id: 'String'
    job: 'Job'
    lastRun: 'DateTime'
    nextRun: 'DateTime'
    objectId: 'String'
    result: 'String'

},  Location: {
    id: 'String'
    name: 'String'
    latitude: 'Float'
    longitude: 'Float'
    jobs: 'Job'
    boundary: 'Float'
    users: 'User'
    Branch: 'Branch'
    Company: 'Company'

},  Permission: {
    id: 'String'
    object: 'String'
    roleId: 'String'
    role: 'Role'
    actions: 'String'

},  Resume: {
    id: 'String'
    title: 'String'
    fileId: 'String'
    file: 'File'
    userId: 'String'
    user: 'User'
    createdAt: 'DateTime'
    updatedAt: 'DateTime'
    applications: 'Application'
    skills: 'Skill'

},  Role: {
    id: 'String'
    name: 'String'
    permissions: 'Permission'
    users: 'User'

},  Skill: {
    id: 'String'
    name: 'String'
    jobs: 'Job'
    resumes: 'Resume'
    users: 'User'

},  User: {
    id: 'String'
    name: 'String'
    email: 'String'
    password: 'String'
    createdAt: 'DateTime'
    updatedAt: 'DateTime'
    applications: 'Application'
    jobs: 'Job'
    locationId: 'String'
    location: 'Location'
    skills: 'Skill'
    favorites: 'Favorite'
    roleId: 'String'
    role: 'Role'
    branchId: 'String'
    branch: 'Branch'
    resumes: 'Resume'
    resetToken: 'String'
    resetTokenExpiry: 'Float'
    status: 'UserStatus'
    ApplicationNote: 'ApplicationNote'

}
}

interface NexusPrismaMethods {
  Application: NexusPrismaFields<'Application'>
  ApplicationNote: NexusPrismaFields<'ApplicationNote'>
  Branch: NexusPrismaFields<'Branch'>
  Category: NexusPrismaFields<'Category'>
  Company: NexusPrismaFields<'Company'>
  Favorite: NexusPrismaFields<'Favorite'>
  File: NexusPrismaFields<'File'>
  Job: NexusPrismaFields<'Job'>
  JobCronTask: NexusPrismaFields<'JobCronTask'>
  Location: NexusPrismaFields<'Location'>
  Permission: NexusPrismaFields<'Permission'>
  Resume: NexusPrismaFields<'Resume'>
  Role: NexusPrismaFields<'Role'>
  Skill: NexusPrismaFields<'Skill'>
  User: NexusPrismaFields<'User'>
  Query: NexusPrismaFields<'Query'>
  Mutation: NexusPrismaFields<'Mutation'>
}
  

declare global {
  type NexusPrisma<
    TypeName extends string,
    ModelOrCrud extends 'model' | 'crud'
  > = GetNexusPrisma<TypeName, ModelOrCrud>;
}
  