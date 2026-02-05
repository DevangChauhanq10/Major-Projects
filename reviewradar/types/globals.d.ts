export {}

// Create a type for the roles
export type Roles = 'admin' | 'analyst' | 'user'

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles
    }
  }
}
