declare namespace Controllers {
  interface UserController {
    get(id: number | string, accessToken?: string): Promise<User>;
    
    signUp(username: string, password: string, meta: Record<string, unknown>): Promise<User>;

    confirmSignUp(username: string, code: string): Promise<User>;

    signIn(username: string, password: string, device?: UserDevice): Promise<{ user: User, refreshToken?: string, accessToken?: string, session?: string }>;

    respondToChallenge(username: string, code: string, session: string): Promise<{ user: User, refreshToken: string, accessToken: string }>;

    signOut(refreshToken: string): Promise<unknown>;

    forgotPassword(username: string): Promise<unknown>;

    confirmForgotPassword(username: string, password: string, code: string): Promise<unknown>;

    setupMFA(username: string, accessToken: string): Promise<unknown>;

    verifyMFA(username: string, code: string, accessToken: string, session: string): Promise<unknown>;
  }

  interface RefreshTokenController {
    create(user: User, device?: UserDevice): Promise<{ accessToken: string, refreshToken: string }>;

    renew(refreshToken: string, device?: UserDevice): Promise<{ user?: User | any, accessToken: string, refreshToken: string }>;

    delete(refreshToken: string): Promise<RefreshToken>;
  }
}
