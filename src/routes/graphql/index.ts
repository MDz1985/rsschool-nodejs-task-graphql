import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, GraphQLList } from 'graphql';
import { PrismaClient } from '@prisma/client';
import { GraphQLBoolean, GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql/index.js';
import { GraphQLFloat } from 'graphql/type/scalars.js';

const prisma = new PrismaClient();

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
      resolve: async () => await prisma.memberType.findMany(),
    },
    posts: {
      type: new GraphQLList(postInterface),
      resolve: async () => await prisma.post.findMany(),
    },
    users: {
      type: new GraphQLList(userInterface),
      resolve: async () => await prisma.user.findMany(),
    },
    profiles: {
      type: new GraphQLList(profileInterface),
      resolve: async () => await prisma.profile.findMany(),
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
      const { query } = req.body;
      const result = await graphql({
        schema: ProjectSchema,
        source: query,
        contextValue: { prisma }
      });

      // console.log(result);
      return {
        data: result.data,
        errors: result.errors,
      };
    },
  });
};

export default plugin;
