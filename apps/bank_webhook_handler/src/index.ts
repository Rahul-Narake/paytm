import express from 'express';
import prisma from '@repo/db/client';
const app = express();

app.use(express.json());

app.post('/api/v1/hdfcWebhook', async (req, res) => {
  //TODO: Add zod validation here?
  //TODO: HDFC bank should ideally send us a secret so we know this is sent by them
  const paymentInformation: {
    token: string;
    userId: string;
    amount: string;
  } = {
    token: req.body.token,
    userId: req.body.user_identifier,
    amount: req.body.amount,
  };

  try {
    const isProcessing = await prisma.onRampTransaction.findFirst({
      where: { token: req.body.token, status: 'Processing' },
    });
    if (isProcessing) {
      await prisma.$transaction([
        prisma.balance.updateMany({
          where: {
            userId: Number(paymentInformation.userId),
          },
          data: {
            amount: {
              increment: Number(paymentInformation.amount),
            },
          },
        }),
        prisma.onRampTransaction.updateMany({
          where: {
            token: paymentInformation.token,
          },
          data: {
            status: 'Success',
          },
        }),
      ]);
      return res
        .json({
          message: 'Captured',
        })
        .status(200);
    } else {
      return res
        .json({
          message: 'Invalid entry',
        })
        .status(400);
    }
  } catch (e) {
    console.error(e);
    res.status(411).json({
      message: 'Error while processing webhook',
    });
  }
});

app.listen(3003, () => {
  console.log('Server started on port 3003');
});
