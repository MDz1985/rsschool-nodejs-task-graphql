import { GraphQLBoolean, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql/index.js';
import { GraphQLFloat } from 'graphql/type/scalars.js';
import { IContext } from '../models/interfaces.js';
import { SubscribersOnAuthors } from '@prisma/client';


export const memberTypeInterface = new GraphQLObjectType({
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

export const postInterface = new GraphQLObjectType({
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

export const profileInterface = new GraphQLObjectType({
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
      resolve: async (parent: { memberTypeId: string }, _, context: IContext) => {
        return context.memberTypeLoader.load(parent.memberTypeId);
      },
    },
  })
});

export const userInterface = new GraphQLObjectType({
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
      resolve: async (parent: { id: string }, _, context: IContext) => {
        return context.profileLoader.load(parent.id);
      }
    },
    posts: {
      type: new GraphQLList(postInterface),
      resolve: async (parent: { id: string }, _, context: IContext) => {
        return await context.postLoader.load(parent.id);
      }
    },
    userSubscribedTo: {
      type: new GraphQLList(userInterface),
      resolve: async (parent: { id: string }, _, context: IContext) => {
        const subscriptions: SubscribersOnAuthors[] | null = await context.userSubscribedToLoader.load(parent.id);
        if (!subscriptions) return [];
        return context.userLoader.loadMany(subscriptions.map(({ authorId }) => authorId));
      }
    },
    subscribedToUser: {
      type: new GraphQLList(userInterface),
      resolve: async (parent: { id: string }, _, context: IContext) => {
        const subscriptions: SubscribersOnAuthors[] | null = await context.subscribedToUserLoader.load(parent.id);
        if (!subscriptions) return [];
        return context.userLoader.loadMany(subscriptions.map(({ subscriberId }: SubscribersOnAuthors) => subscriberId));
      }
    }
  })
});
