import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, GraphQLList } from 'graphql';
import { GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql/index.js';
import { memberTypeId, UUIDType } from './types/uuid.js';
import {
  changePostInputType,
  changePostResultType, changeProfileInputType,
  changeProfileResultType, changeUserInputType, changeUserResultType,
  postInputType,
  profileInputType, subscribeResult,
  userInputType
} from './types/mutations.js';
import { memberTypeInterface, postInterface, profileInterface, userInterface } from './types/queries.js';
import DataLoader from 'dataloader';
import { MemberType, Post, Profile, SubscribersOnAuthors, User } from '@prisma/client';


const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;


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
        resolve: (_, args: { id: string }, context) =>
          context.prisma.memberType.findUnique({ where: { id: args.id } })
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
          console.log(args);
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
          dto: { content?: string, title?: string }
        }) => {
          return await prisma.post.update({ where: { id: args.id }, data: args.dto });
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

      subscribeTo: {
        type: subscribeResult,
        args: {
          userId: { type: UUIDType },
          authorId: { type: UUIDType }
        },
        resolve: async (_, args: {
          userId: string,
          authorId: string
        }) => {
          return await prisma.subscribersOnAuthors.create({ data: { authorId: args.authorId, subscriberId: args.userId } });
        },
      },

      unsubscribeFrom: {
        type: GraphQLString,
        args: {
          userId: { type: UUIDType },
          authorId: { type: UUIDType }
        },
        resolve: async (_, args: {
          userId: string,
          authorId: string
        }) => {
          return JSON.stringify(await prisma.subscribersOnAuthors.delete({
            where: {
              subscriberId_authorId: {
                authorId: args.authorId,
                subscriberId: args.userId
              }
            }
          }));
        },
      }
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

      const memberTypeLoader = new DataLoader<string, MemberType | null>(async (keys) => {
        const memberTypes = await prisma.memberType.findMany({
          where: { id: { in: keys as string[] } },
        });
        const memberTypeMap: Record<string, MemberType> = {};
        memberTypes.forEach((memberType) => {
          memberTypeMap[memberType.id] = memberType;
        });
        return keys.map((key) => memberTypeMap[key] || null);
      });

      const profileLoader = new DataLoader<string, Profile | null>(async (keys) => {
        const profiles = await prisma.profile.findMany({
          where: { userId: { in: keys as string[] } },
        });
        const profileMap: Map<string, Profile> = new Map();
        profiles.forEach((profile) => {
          profileMap.set(profile.userId, profile);
        });
        return keys.map((key) => profileMap.get(key) ?? null);
      });

      const postLoader = new DataLoader<string, Post[] | null>(async (keys) => {
        const posts = await prisma.post.findMany({
          where: { authorId: { in: keys as string[] } }
        });
        const postMap: Map<string, Post[]> = new Map();
        posts.forEach((post) => {
          if (!postMap.has(post.authorId)) {
            postMap.set(post.authorId, []);
          }
          postMap.get(post.authorId)?.push(post);
        });
        // console.log(postMap.values(), '@@');

        return keys.map((key) => postMap.get(key) ?? null);
      });

      const userLoader = new DataLoader<string, User | null>(async (keys) => {
        const users = await prisma.user.findMany({
          where: { id: { in: keys as string[] } },
        });
        const userMap: Record<string, User> = {};
        users.forEach((user) => {
          userMap[user.id] = user;
        });
        return keys.map((key) => userMap[key] || null);
      });


      const subscriptions = await prisma.subscribersOnAuthors.findMany();
      const userSubscribedToLoader = new DataLoader<string, SubscribersOnAuthors[] | null>(async (keys) => {
        const subscriptions = await prisma.subscribersOnAuthors.findMany({
          where: { subscriberId: { in: keys as string[] } },
        });
        const subscriptionsMap: Map<string, SubscribersOnAuthors[]> = new Map();
        subscriptions.forEach((subscription) => {
          if (!subscriptionsMap.has(subscription.subscriberId)) {
            subscriptionsMap.set(subscription.subscriberId, []);
          }
          subscriptionsMap.get(subscription.subscriberId)?.push(subscription);
        });
        return keys.map((key) => subscriptionsMap.get(key) ?? null);
      });

      const subscribedToUserLoader = new DataLoader<string, SubscribersOnAuthors[] | null>(async (keys) => {
        const subscriptions = await prisma.subscribersOnAuthors.findMany({
          where: { authorId: { in: keys as string[] } },
        });
        const subscriptionsMap: Record<string, SubscribersOnAuthors[]> = {};
        subscriptions.forEach((subscription) => {

          if (!subscriptionsMap[subscription.authorId]) {
            subscriptionsMap[subscription.authorId] = [];
          }
          subscriptionsMap[subscription.authorId].push(subscription);
        });

        return keys.map((key) => subscriptionsMap[key] || null);
      });

      const result = await graphql({
        schema: ProjectSchema,
        source: query,
        variableValues: variables,
        contextValue: {
          prisma,
          memberTypeLoader,
          postLoader,
          userSubscribedToLoader,
          subscribedToUserLoader,
          userLoader,
          profileLoader
        },
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
