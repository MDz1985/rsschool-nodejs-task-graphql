import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, GraphQLList, GraphQLScalarType } from 'graphql';
import { GraphQLBoolean, GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql/index.js';
import { GraphQLFloat } from 'graphql/type/scalars.js';
import { UUIDType } from './types/uuid.js';


const memberTypeId = new GraphQLScalarType({
  name: 'MemberTypeId',
  parseValue(value) {
    return value;
  }
});

const memberTypeInterface = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
    },
    discount: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
    postsLimitPerMonth: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
  })
});

const postInterface = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
    },
    content: {
      type: new GraphQLNonNull(GraphQLString),
    },
    authorId: {
      type: new GraphQLNonNull(GraphQLString),
    },
  })
});

const profileInterface = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
    },
    isMale: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    yearOfBirth: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    userId: {
      type: new GraphQLNonNull(GraphQLString),
    },
    memberTypeId: {
      type: new GraphQLNonNull(GraphQLString),
    },
    memberType: {
      type: memberTypeInterface
    }
  })
});

const userInterface = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    balance: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
    profile: {
      type: profileInterface
    },
    posts: {
      type: new GraphQLList(postInterface)
    },
    userSubscribedTo: {
      type: new GraphQLList(userInterface)
    },
    subscribedToUser: {
      type: new GraphQLList(userInterface)
    }
  })
});




const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;
  const myQueryType = new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      memberTypes: {
        type: new GraphQLList(memberTypeInterface),
        resolve: async () => await prisma.memberType.findMany()
      },
      memberType: {
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
            type: UUIDType
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
            type: UUIDType
          }
        },
        resolve: async (_, args: { id: string }) => {
          const user = await prisma.user.findUnique({ where: { id: args.id } });
          if (!user?.id) return null;
          const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
          const posts = await prisma.post.findMany({ where: { authorId: user.id } });
          const userSubscribedTo = await prisma.post.findMany({ where: { authorId: user.id } });
          const subscribedToUser = null;

          console.log(user, profile, posts, userSubscribedTo, subscribedToUser);


          return user ? { ...user, profile, posts } : null;
        }
      },
      profiles: {
        type: new GraphQLList(profileInterface),
        resolve: async () => await prisma.profile.findMany()
      },
      profile: {
        type: profileInterface,
        args: {
          id: {
            type: UUIDType
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
