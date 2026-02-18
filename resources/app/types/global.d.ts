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
    display_name?: string;
    avatar_url?: string;
    created_at?: string;
    privileges?: string[];
    [key: string]: unknown;
  }
}
