import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      familyId: string;
      role: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    familyId?: string;
    role?: string;
  }
}
