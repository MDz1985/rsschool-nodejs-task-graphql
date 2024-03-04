import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql/index.js';
import { postInterface, profileInterface, userInterface } from './types/queries.js';
import {
  changePostInputType,
  changePostResultType, changeProfileInputType,
  changeProfileResultType, changeUserInputType, changeUserResultType,
  postInputType,
  profileInputType, subscribeResult,
  userInputType
} from './types/mutations.js';
import { UUIDType } from './types/uuid.js';
import { IContext } from './models/interfaces.js';

export const myMutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    createPost: {
      type: postInterface,
      args: {
        dto: { type: postInputType }
      },
      resolve: async (_, args: { dto: { authorId: string, content: string, title: string } }, context: IContext) => {
        return context.prisma.post.create({ data: args.dto });
      },
    },
    createUser: {
      type: userInterface,
      args: {
        dto: { type: userInputType }
      },
      resolve: async (_, args: { dto: { name: string, balance: number } }, context: IContext) => {
        return context.prisma.user.create({ data: args.dto });
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
      }, context: IContext) => {
        return context.prisma.profile.create({ data: args.dto });
      },
    },
    deletePost: {
      type: GraphQLString,
      args: {
        id: { type: UUIDType }
      },
      resolve: async (_, args: {
        id: string
      }, context: IContext) => {
        return JSON.stringify(await context.prisma.post.delete({ where: { id: args.id } }));
      },
    },
    deleteProfile: {
      type: GraphQLString,
      args: {
        id: { type: UUIDType }
      },
      resolve: async (_, args: {
        id: string
      }, context: IContext) => {
        return JSON.stringify(await context.prisma.profile.delete({ where: { id: args.id } }));
      },
    },
    deleteUser: {
      type: GraphQLString,
      args: {
        id: { type: UUIDType }
      },
      resolve: async (_, args: {
        id: string
      }, context: IContext) => {
        return JSON.stringify(await context.prisma.user.delete({ where: { id: args.id } }));
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
      }, context: IContext) => {
        return await context.prisma.post.update({ where: { id: args.id }, data: args.dto });
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
      }, context: IContext) => {
        return context.prisma.profile.update({ where: { id: args.id }, data: args.dto });
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
      }, context: IContext) => {
        return context.prisma.user.update({ where: { id: args.id }, data: args.dto });
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
      }, context: IContext) => {
        return await context.prisma.subscribersOnAuthors.create({ data: { authorId: args.authorId, subscriberId: args.userId } });
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
      }, context: IContext) => {
        return JSON.stringify(await context.prisma.subscribersOnAuthors.delete({
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
