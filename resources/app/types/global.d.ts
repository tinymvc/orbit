export {};

declare global {
  interface AppConfig {
    name: string;
    timezone: string;
    locale: string;
    [key: string]: any;
  }

  interface User {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    status: string;
    display_name?: string;
    avatar_url?: string;
    email_verified_at?: string;
    created_at?: string;
    privileges?: string[];
    roles?: Role[];
    [key: string]: unknown;
  }

  interface Role {
    id: number;
    name: string;
    slug: string;
    privileges: string[];
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
  }
}
