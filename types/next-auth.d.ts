import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    hasPaid: boolean
  }

  interface Session {
    user: {
      id: string
      hasPaid: boolean
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    hasPaid?: boolean
  }
}
