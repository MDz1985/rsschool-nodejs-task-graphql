import { GraphQLBoolean, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql/index.js';
import { GraphQLFloat } from 'graphql/type/scalars.js';
import { UUIDType } from './uuid.js';


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
      resolve: async (parent: { memberTypeId: string }, args, context) => {
        return context.memberTypeLoader.load(parent.memberTypeId);
      },
    },
  })
});

export const subscribedToInterface = new GraphQLObjectType({
  name: 'SubscribedToUser',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    userSubscribedTo: {
      type: new GraphQLList(userInterface),
      resolve: async (source: { id: string }, _, context) => {
        const subscriptions = await context.userSubscribedToLoader.load(source.id);
        if (!subscriptions) return [];
        return context.userLoader.loadMany(subscriptions.map(({ authorId }) => authorId));
      }
    },
    subscribedToUser: {
      type: new GraphQLList(userInterface),
      resolve: async (source: { id: string }, _, context) => {
        const subscriptions = await context.subscribedToUserLoader.load(source.id);
        if (!subscriptions) return [];
        return context.userLoader.loadMany(subscriptions.map(({ subscriberId }) => subscriberId));
      }
    }
  })
});

export const userSubscribedToInterface = new GraphQLObjectType({
  name: 'UserSubscribedTo',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    userSubscribedTo: {
      type: new GraphQLList(userInterface),
      resolve: async (source: { id: string }, _, context) => {
        const subscriptions = await context.userSubscribedToLoader.load(source.id);
        if (!subscriptions) return [];
        return context.userLoader.loadMany(subscriptions.map(({ authorId }) => authorId));
      }
    },
    subscribedToUser: {
      type: new GraphQLList(userInterface),
      resolve: async (source: { id: string }, _, context) => {
        const subscriptions = await context.subscribedToUserLoader.load(source.id);
        if (!subscriptions) return [];
        return context.userLoader.loadMany(subscriptions.map(({ subscriberId }) => subscriberId));
      }
    }
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
      resolve: async (parent: { id: string }, _, context) => {
        return context.profileLoader.load(parent.id);
      }
    },
    posts: {
      type: new GraphQLList(postInterface),
      resolve: async (parent, args, context) => {
        return await context.postLoader.load(parent.id);
      }
    },
    userSubscribedTo: {
      type: new GraphQLList(userSubscribedToInterface),
      resolve: async (parent: { id: string }, _, context) => {
        const subscriptions = await context.userSubscribedToLoader.load(parent.id);
        if (!subscriptions) return [];
        return context.userLoader.loadMany(subscriptions.map(({ authorId }) => authorId));
      }
    },
    subscribedToUser: {
      type: new GraphQLList(subscribedToInterface),
      resolve: async (parent: { id: string }, _, context) => {
        const subscriptions = await context.subscribedToUserLoader.load(parent.id);
        if (!subscriptions) return [];
        return context.userLoader.loadMany(subscriptions.map(({ subscriberId }) => subscriberId));
      }
    }
  })
});
