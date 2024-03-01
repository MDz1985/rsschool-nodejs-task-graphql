import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, GraphQLList, GraphQLScalarType, Kind, ValueNode } from 'graphql';
import { PrismaClient } from '@prisma/client';
import { GraphQLBoolean, GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql/index.js';
import { GraphQLFloat } from 'graphql/type/scalars.js';

const prisma = new PrismaClient();

const GraphQLUUID = new GraphQLScalarType({
  name: 'UUID',
  description: 'A UUID scalar type',
  serialize(value) {
    if (typeof value === 'string' && isValidUUID(value)) {
      return value;
    }
    throw new Error('Invalid UUID format');
  },
  parseValue(value) {
    if (typeof value === 'string' && isValidUUID(value)) {
      return value;
    }
    throw new Error('Invalid UUID format');
  },
  parseLiteral(ast: ValueNode) {
    if (ast.kind === Kind.STRING && isValidUUID(ast.value)) {
      return ast.value;
    }
    throw new Error('Invalid UUID format');
  },
});

function isValidUUID(uuid: string) {
  // Your validation logic here
  // For a simple check, you can use a regex or a library like 'uuid'
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(uuid);
}

const memberTypeId = new GraphQLScalarType({
  name: 'MemberTypeId',
  parseValue (value) {
    return value
  }
})

const memberTypeInterface = new GraphQLObjectType({
  name: 'MemberType',
  description: 'A character in the Star Wars Trilogy',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the character.',
    },
    discount: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'The id of the character.',
    },
    postsLimitPerMonth: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'The id of the character.',
    },
  })
});

const postInterface = new GraphQLObjectType({
  name: 'Post',
  description: 'A character in the Star Wars Trilogy',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the character.',
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the character.',
    },
    content: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the character.',
    },
    authorId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the character.',
    },
  })
});

const userInterface = new GraphQLObjectType({
  name: 'User',
  description: 'A character in the Star Wars Trilogy',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the character.',
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the character.',
    },
    balance: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'The id of the character.',
    },
  })
});

const profileInterface = new GraphQLObjectType({
  name: 'Profile',
  description: 'A character in the Star Wars Trilogy',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the character.',
    },
    isMale: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'The id of the character.',
    },
    yearOfBirth: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The id of the character.',
    },
    userId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the character.',
    },
    memberTypeId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the character.',
    },
  })
});

const myQueryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    memberTypes: {
      type: new GraphQLList(memberTypeInterface),
      resolve: async () => await prisma.memberType.findMany()
    },
    memberType : {
      type: memberTypeInterface,
      args: {
        id: {
          type: memberTypeId
        }
      },
      resolve: async (_, args: { id: string }) =>
        await prisma.memberType.findUnique({ where: { id: args.id } })
    },
    posts: {
      type: new GraphQLList(postInterface),
      resolve: async () => await prisma.post.findMany()
    },
    post: {
      type: postInterface,
      args: {
        id: {
          type: GraphQLUUID
        }
      },
      resolve: async (_, args: { id: string }) => await prisma.post.findUnique({ where: { id: args.id } })
    },

    users: {
      type: new GraphQLList(userInterface),
      resolve: async () => await prisma.user.findMany()
    },
    user: {
      type: userInterface,
      args: {
        id: {
          type: GraphQLUUID
        }
      },
      resolve: async (_, args: { id: string }) => await prisma.user.findUnique({ where: { id: args.id } })
    },
    profiles: {
      type: new GraphQLList(profileInterface),
      resolve: async () => await prisma.profile.findMany()
    },
    profile: {
      type: profileInterface,
      args: {
        id: {
          type: GraphQLUUID
        }
      },
      resolve: async (_, args: { id: string }) =>
        await prisma.profile.findUnique({ where: { id: args.id } })
    },
  }),
});

const ProjectSchema = new GraphQLSchema({
  query: myQueryType,
});

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },

    async handler(req) {
      const { query, variables } = req.body;
      const result = await graphql({
        schema: ProjectSchema,
        source: query,
        variableValues: variables,
        contextValue: { prisma }
      });
      console.log(result?.errors);
      return {
        data: result.data,
        errors: result.errors,
      };
    },
  });
};

export default plugin;
