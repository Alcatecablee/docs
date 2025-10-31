declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        plan?: string;
        databaseId?: number;
        [key: string]: any;
      };
      apiUser?: {
        id: number;
        email: string;
        plan: string;
        api_usage: number;
        balance: string;
      };
      dbUser?: {
        id: number;
        email: string;
        plan: string;
        is_admin: boolean;
        subscription_status: string | null;
        generation_count: number;
        api_key: string | null;
      };
    }
  }
}

export {};
