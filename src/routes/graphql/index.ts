import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, GraphQLInputObjectType, GraphQLList, GraphQLScalarType } from 'graphql';
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


const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

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
        type: memberTypeInterface,
        resolve: async (parent: { memberTypeId: string }) => {
          return await prisma.memberType.findUnique({ where: { id: parent.memberTypeId } });
        }
      },
    })
  });

  const subscribedToInterface = new GraphQLObjectType({
    name: 'SubscribedToUser',
    fields: () => ({
      id: { type: new GraphQLNonNull(UUIDType) },
      name: { type: new GraphQLNonNull(GraphQLString) },
      balance: { type: new GraphQLNonNull(GraphQLFloat) },
      userSubscribedTo: {
        type: new GraphQLList(userInterface),
        resolve: async (source: { id: string }) => {
          const subscriptions = await prisma.subscribersOnAuthors?.findMany();
          return Promise.all(subscriptions?.filter(({ subscriberId }) => subscriberId === source?.id)
            .map(({ authorId }) => prisma.user.findUnique({ where: { id: authorId } }))
          );
        }
      },
      subscribedToUser: {
        type: new GraphQLList(userInterface),
        resolve: async (source: { id: string }) => {
          const subscriptions = await prisma.subscribersOnAuthors?.findMany();
          return Promise.all(subscriptions?.filter(({ authorId }) => authorId === source?.id)
            .map(({ subscriberId }) => prisma.user.findUnique({ where: { id: subscriberId } }))
          );
        }
      }
    })
  });

  const userSubscribedToInterface = new GraphQLObjectType({
    name: 'UserSubscribedTo',
    fields: () => ({
      id: { type: new GraphQLNonNull(UUIDType) },
      name: { type: new GraphQLNonNull(GraphQLString) },
      balance: { type: new GraphQLNonNull(GraphQLFloat) },
      userSubscribedTo: {
        type: new GraphQLList(userInterface),
        resolve: async (source: { id: string }) => {
          const subscriptions = await prisma.subscribersOnAuthors?.findMany();
          return Promise.all(subscriptions?.filter(({ subscriberId }) => subscriberId === source?.id)
            .map(({ authorId }) => prisma.user.findUnique({ where: { id: authorId } }))
          );
        }
      },
      subscribedToUser: {
        type: new GraphQLList(userInterface),
        resolve: async (source: { id: string }) => {
          const subscriptions = await prisma.subscribersOnAuthors?.findMany();
          return Promise.all(subscriptions?.filter(({ authorId }) => authorId === source?.id)
            .map(({ subscriberId }) => prisma.user.findUnique({ where: { id: subscriberId } }))
          );
        }
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
        type: profileInterface,
        resolve: async (parent: { id: string }) => {
          return await prisma.profile.findUnique({ where: { userId: parent.id } });
        }
      },
      posts: {
        type: new GraphQLList(postInterface),
        resolve: async (parent) => {
          return await prisma.post.findMany({ where: { authorId: parent.id } });
        }
      },
      userSubscribedTo: {
        type: new GraphQLList(userSubscribedToInterface),
        resolve: async (parent: { id: string }) => {
          const subscriptions = await prisma.subscribersOnAuthors?.findMany();
          return Promise.all(subscriptions?.filter(({ subscriberId }) => subscriberId === parent.id)
            .map(({ authorId }) => prisma.user.findUnique({ where: { id: authorId } }))
          );
        }
      },
      subscribedToUser: {
        type: new GraphQLList(subscribedToInterface),
        resolve: async (parent: { id: string }) => {
          const subscriptions = await prisma.subscribersOnAuthors?.findMany();
          return Promise.all(subscriptions?.filter(({ authorId }) => authorId === parent.id)
            .map(({ subscriberId }) => prisma.user.findUnique({ where: { id: subscriberId } }))
          );
        }
      }
    })
  });

  const userInputType = new GraphQLInputObjectType({
    name: 'CreateUserInput',
    fields: () => ({
      name: { type: new GraphQLNonNull(UUIDType) },
      balance: { type: new GraphQLNonNull(GraphQLFloat), }
    })
  });

  const postInputType = new GraphQLInputObjectType({
    name: 'CreatePostInput',
    fields: () => ({
      authorId: {
        type: new GraphQLNonNull(UUIDType),
      },
      content: { type: new GraphQLNonNull(GraphQLString) },
      title: { type: new GraphQLNonNull(GraphQLString) }
    })
  });

  const profileInputType = new GraphQLInputObjectType({
    name: 'CreateProfileInput',
    fields: () => ({
      userId: { type: UUIDType },
      memberTypeId: { type: new GraphQLNonNull(memberTypeId) },
      isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
      yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    })
  });

  const changeUserInputType = new GraphQLInputObjectType({
    name: 'ChangeUserInput',
    fields: () => ({
      name: { type: GraphQLString },
      balance: { type: GraphQLFloat, }
    })
  });

  const changePostInputType = new GraphQLInputObjectType({
    name: 'ChangePostInput',
    fields: () => ({
      content: { type: GraphQLString },
      title: { type: GraphQLString }
    })
  });

  const changeProfileInputType = new GraphQLInputObjectType({
    name: 'ChangeProfileInput',
    fields: () => ({
      isMale: { type: GraphQLBoolean },
      yearOfBirth: { type: GraphQLInt },
    })
  });

  const changePostResultType = new GraphQLObjectType({
    name: 'ChangePostResult',
    fields: () => ({
      id: {
        type: new GraphQLNonNull(UUIDType),
      },
      title: {
        type: new GraphQLNonNull(GraphQLString),
      },
      content: {
        type: new GraphQLNonNull(GraphQLString),
      },
      authorId: {
        type: new GraphQLNonNull(UUIDType),
      },
    })
  });

  const changeProfileResultType = new GraphQLObjectType({
    name: 'ChangeProfileResult',
    fields: () => ({
      id:{type:UUIDType}
    }),
  });

  const changeUserResultType = new GraphQLObjectType({
    name: 'ChangeUserResult',
    fields: () => ({
      id:{type:UUIDType}
    }),
  });

  const myQueryType = new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      memberTypes: {
        type: new GraphQLList(memberTypeInterface),
        resolve: () => prisma.memberType.findMany()
      },
      memberType: {
        type: memberTypeInterface,
        args: {
          id: {
            type: memberTypeId
          }
        },
        resolve: (_, args: { id: string }) =>
          prisma.memberType.findUnique({ where: { id: args.id } })
      },
      posts: {
        type: new GraphQLList(postInterface),
        resolve: () => prisma.post.findMany()
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
        resolve: () => prisma.user.findMany()
      },
      user: {
        type: userInterface,
        args: {
          id: {
            type: UUIDType
          }
        },
        resolve: async (_, args: { id: string }) => {
          return prisma.user.findUnique({ where: { id: args.id } });
        }
      },
      profiles: {
        type: new GraphQLList(profileInterface),
        resolve: () => prisma.profile.findMany()
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

  const myMutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: () => ({
      createPost: {
        type: postInterface,
        args: {
          dto: { type: postInputType }
        },
        resolve: async (_, args: { dto: { authorId: string, content: string, title: string } }) => {
          return prisma.post.create({ data: args.dto });
        },
      },
      createUser: {
        type: userInterface,
        args: {
          dto: { type: userInputType }
        },
        resolve: async (_, args: { dto: { name: string, balance: number } }) => {
          return prisma.user.create({ data: args.dto });
        },
      },
      createProfile: {
        type: profileInterface,
        args: {
          dto: { type: profileInputType }
        },
        resolve: async (_, args: {
          dto: {
            userId: string,
            memberTypeId: string,
            isMale: boolean,
            yearOfBirth: number
          }
        }) => {
            return prisma.profile.create({ data: args.dto });
        },
      },
      deletePost: {
        type: GraphQLString,
        args: {
          id: { type: UUIDType }
        },
        resolve: async (_, args: {
          id: string
        }) => {
          console.log(args)
          return JSON.stringify(await prisma.post.delete({ where: { id: args.id } }));
        },
      },
      deleteProfile: {
        type: GraphQLString,
        args: {
          id: { type: UUIDType }
        },
        resolve: async (_, args: {
          id: string
        }) => {
          return JSON.stringify(await prisma.profile.delete({ where: { id: args.id } }));
        },
      },
      deleteUser: {
        type: GraphQLString,
        args: {
          id: { type: UUIDType }
        },
        resolve: async (_, args: {
          id: string
        }) => {
          return JSON.stringify(await prisma.user.delete({ where: { id: args.id } }));
        },
      },


      changePost: {
        type: changePostResultType,
        args: {
          id: { type: UUIDType },
          dto: { type: new GraphQLNonNull(changePostInputType) }
        },
        resolve: async (_, args: {
          id: string,
          dto:  { content?: string, title?: string }
        }) => {
          return await prisma.post.update({ where: { id: args.id }, data: args.dto  });
        },
      },

      changeProfile: {
        type: changeProfileResultType,
        args: {
          id: { type: UUIDType },
          dto: { type: changeProfileInputType }
        },
        resolve: async (_, args: {
          id: string,
          dto: {
            isMale?: boolean,
            yearOfBirth?: number
          }
        }) => {
          return prisma.profile.update({ where: { id: args.id }, data: args.dto });
        },
      },

      changeUser: {
        type: changeUserResultType,
        args: {
          id: { type: UUIDType },
          dto: { type: changeUserInputType }
        },
        resolve: async (_, args: {
          id: string,
          dto: { name?: string, balance?: number }
        }) => {
          return prisma.user.update({ where: { id: args.id }, data: args.dto });
        },
      },
    }),
  });

  const ProjectSchema = new GraphQLSchema({
    query: myQueryType,
    mutation: myMutationType
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
      console.log(result.errors, '#@ERRORS');

      return {
        data: result.data,
        errors: result.errors,
      };
    },
  });
};

export default plugin;
