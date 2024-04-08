'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '../auth';
import prisma from '@repo/db/client';
export async function sendMoney(number: string, amount: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !session?.user?.id) {
    return { message: 'Unauthenticated request' };
  }
  try {
    const toUser = await prisma.user.findFirst({
      where: { number: String(number) },
    });
    if (!toUser) {
      return { message: 'User not exist with this number' };
    }
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT * FROM "Balance" WHERE "userId" = ${Number(session?.user?.id)} FOR UPDATE`;

      const fromUserBalance = await tx.balance.findUnique({
        where: { userId: Number(session?.user?.id) },
      });
      if (!fromUserBalance || fromUserBalance.amount < amount) {
        throw new Error('Insufficent funds');
      }
      await tx.balance.update({
        where: { userId: Number(session?.user?.id) },
        data: { amount: { decrement: Number(amount) } },
      });
      await tx.balance.update({
        where: { userId: Number(toUser?.id) },
        data: { amount: { increment: Number(amount) } },
      });
      await prisma.p2pTransfer.create({
        data: {
          amount: Number(amount),
          timestamp: new Date(),
          fromUserId: Number(session?.user?.id),
          toUserId: Number(toUser?.id),
        },
      });
    });

    return { message: 'Money send successfully', success: true };
  } catch (error) {
    console.log(error);
    return { message: 'Money Not send successfully', success: false };
  }
}
