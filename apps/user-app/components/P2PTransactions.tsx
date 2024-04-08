import { Card } from '@repo/ui/card';
import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/auth';

export const P2PTransactions = async ({
  recentTransactions,
}: {
  recentTransactions: {
    time: Date;
    amount: number;
    toUser: number;
    fromUser: number;
  }[];
}) => {
  const session = await getServerSession(authOptions);
  if (!recentTransactions.length) {
    return (
      <Card title="Recent Transactions">
        <div className="text-center pb-8 pt-8">No Recent transactions</div>
      </Card>
    );
  }
  return (
    <Card title="Recent Transactions">
      <div className="pt-2">
        {recentTransactions.map((t) => (
          <div className="flex justify-between border-b border-slate-300">
            <div>
              <div className="text-sm">
                {t.fromUser.toString() === session?.user.id
                  ? 'Sent'
                  : 'Receive'}
              </div>
              <div className="text-slate-600 text-xs">
                {t.time.toDateString()}
              </div>
            </div>
            <div className={`flex flex-col justify-center `}>
              {' '}
              {t.fromUser.toString() === session?.user.id ? (
                <p className="text-red-500">- {t.amount / 100}</p>
              ) : (
                <p className="text-green-500">+ {t.amount / 100}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
