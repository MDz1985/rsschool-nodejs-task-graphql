import DataLoader from 'dataloader';
import { MemberType, Post, PrismaClient, Profile, SubscribersOnAuthors, User } from '@prisma/client';
import { ILoaders } from '../models/interfaces.js';

export function createLoaders(prisma: PrismaClient): ILoaders {
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

  return {
    memberTypeLoader,
    postLoader,
    userSubscribedToLoader,
    subscribedToUserLoader,
    userLoader,
    profileLoader,
  };
}
