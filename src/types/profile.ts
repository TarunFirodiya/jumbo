
export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  full_name: string | null;
  phone_number: string | null;
  role: 'admin' | 'agent' | 'user';
  email: string | null;
  avatar_url: string | null;
}
