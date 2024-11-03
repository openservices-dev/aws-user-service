type User = {
  id: number | string;
  username: string;
  password: string;
  meta: Record<string, unknown>;
  groups?: string[];
  otpSecret: string | null;
  otpEnabled: 0 | 1;
  isActive: 0 | 1;
  createdAt: string;
  updatedAt: string;
}

type RefreshToken = {
  id: number | string;
  parentId: number | null;
  userId: number;
  token: string;
  meta: Record<string, unknown>;
  isActive: 0 | 1;
  createdAt: string;
  expiresAt: string;
}

type VerificationToken = {
  id: number | string;
  userId: number;
  token: string;
  createdAt: string;
}

type UserDevice = {
  os: string;
  browser: string;
  ip: string;
}

interface Callback {
  call(data: unknown): Promise<unknown>;
}
