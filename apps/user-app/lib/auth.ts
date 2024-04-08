import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import prisma from '@repo/db/client';
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        phone: {
          label: 'Phone Number',
          type: 'text',
          placeholder: '1234567895',
          required: true,
        },
        password: {
          label: 'Password',
          type: 'password',
          placeholder: '....',
          required: true,
        },
      },
      async authorize(credentials: any) {
        // if (
        //   credentials.phone.length < 10 ||
        //   credentials.phone.length > 10 ||
        //   credentials.password.length < 6
        // ) {
        //   return null;
        // }
        const hashedPassword = await bcrypt.hash(credentials.password, 10);

        const existingUser = await prisma.user.findFirst({
          where: {
            number: credentials.phone,
          },
        });

        if (existingUser) {
          const vaildPassword = await bcrypt.compare(
            credentials.password,
            existingUser.password
          );
          if (vaildPassword) {
            return {
              id: existingUser.id.toString(),
              name: existingUser.name,
              email: existingUser.number,
            };
          }
          return null;
        }

        try {
          await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
              data: {
                number: credentials.phone,
                password: hashedPassword,
              },
            });
            await tx.balance.create({
              data: { amount: 0, locked: 0, userId: Number(user?.id) },
            });

            return {
              id: user.id.toString(),
              name: user.name,
              email: user.number,
            };
          });
        } catch (e) {
          console.error(e);
        }

        return null;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || 'secret45',
  callbacks: {
    async session({ token, session }: any) {
      console.log(session);
      if (session && session.user) session.user.id = token.sub;
      return session;
    },
    jwt: async ({ user, token }: any) => {
      if (user) {
        token.uid = user.id;
        token.jwtToken = user.token;
      }
      return token;
    },
  },
};
