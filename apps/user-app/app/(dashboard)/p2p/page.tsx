import SendMoney from '../../../components/SendMoney';
import prisma from '@repo/db/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { P2PTransactions } from '../../../components/P2PTransactions';
const getRecentTransactions = async () => {
  const session = await getServerSession(authOptions);
  console.log(session);
  try {
    const txns = await prisma.p2pTransfer.findMany({
      where: {
        OR: [
          { fromUserId: Number(session?.user?.id) },
          { toUserId: Number(session?.user?.id) },
        ],
      },
    });

    return txns.map((t) => ({
      time: t.timestamp,
      amount: t.amount,
      toUser: t.toUserId,
      fromUser: t.fromUserId,
    }));
  } catch (error) {
    console.log(error);
    throw new Error('Something went wrong');
  }
};

const PeerToPeerTransfer = async () => {
  const recentTransactions = await getRecentTransactions();
  return (
    <div className="w-screen">
      <div className="text-4xl text-[#6a51a6] pt-8 mb-8 font-bold">
        Transfer
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 p-4">
        <div>
          <SendMoney />
        </div>
        <div>
          <div className="pt-4">
            <P2PTransactions recentTransactions={recentTransactions || []} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default PeerToPeerTransfer;
