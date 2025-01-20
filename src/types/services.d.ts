declare namespace Services {
  interface Token {
    generate(data: Record<string, unknown>, expiresIn?: number): string;

    verify(token: string): Record<string, unknown> | Promise<Record<string, unknown>>;

    decode(token: string): unknown;
  }

  interface IAM {
    get(id: string, accessToken: string): Promise<unknown>;

    signUp(username: string, password: string, meta: Record<string, unknown>): Promise<User>;

    confirmSignUp(username: string, code: string): Promise<unknown>;

    signIn(username: string, password: string, device?: UserDevice): Promise<unknown>;

    respondToChallenge(username: string, code: string, session: string): Promise<unknown>;

    signOut(refreshToken: string): Promise<unknown>;

    forgotPassword(username: string): Promise<unknown>;

    confirmForgotPassword(username: string, password: string, code: string): Promise<unknown>;

    setupMFA(username: string, accessToken: string): Promise<unknown>;

    verifyMFA(username: string, code: string, accessToken: string, session: string): Promise<unknown>;

    renewTokens(refreshToken: string): Promise<unknown>;

    deleteToken(refreshToken: string): Promise<unknown>;
  }

  interface Trace {
    openSegment(defaultName: string): unknown;

    closeSegment(): unknown;

    createSegment(name: string): unknown;

    setSegment(segment: unknown): void;

    getTraceId(): string;

    getNamespace(): unknown;

    captureAWSv3Client<T>(client: T): T;
  }
}
