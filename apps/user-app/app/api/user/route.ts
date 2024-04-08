import { NextResponse } from 'next/server';
import { authOptions } from '../../../lib/auth';
import { getServerSession } from 'next-auth';

export const GET = async () => {
  try {
    const session = await getServerSession(authOptions);

    if (session.user) {
      return NextResponse.json({ user: session.user });
    }
    return NextResponse.json(
      { message: 'You are not loggedIn' },
      { status: 403 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Something went wrong on server' },
      { status: 500 }
    );
  }
};
