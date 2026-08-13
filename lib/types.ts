export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      apps: {
        Row: App;
        Insert: Omit<App, 'id' | 'created_at'>;
        Update: Partial<Omit<App, 'id' | 'created_at'>>;
      };
      events: {
        Row: Event;
        Insert: Omit<Event, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Event, 'id' | 'created_at'>>;
      };
      portfolio_projects: {
        Row: PortfolioProject;
        Insert: Omit<PortfolioProject, 'id' | 'created_at'>;
        Update: Partial<Omit<PortfolioProject, 'id' | 'created_at'>>;
      };
      support_tickets: {
        Row: SupportTicket;
        Insert: Omit<SupportTicket, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SupportTicket, 'id' | 'created_at'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'>;
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>;
      };
      activity_log: {
        Row: ActivityLog;
        Insert: Omit<ActivityLog, 'id' | 'created_at'>;
        Update: Partial<Omit<ActivityLog, 'id' | 'created_at'>>;
      };
      project_automations: {
        Row: ProjectAutomation;
        Insert: Omit<ProjectAutomation, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ProjectAutomation, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
};

export type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  company: string | null;
  job_title: string | null;
  phone: string | null;
  website: string | null;
  bio: string | null;
  telegram_username: string | null;
  telegram_chat_id: string | null;
  telegram_verified: boolean | null;
  whatsapp_number: string | null;
  whatsapp_verified: boolean | null;
  twitter_username: string | null;
  linkedin_url: string | null;
  github_username: string | null;
  role: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

export type App = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: string | null;
  status: 'active' | 'development' | 'beta' | 'coming_soon';
  url: string | null;
  is_featured: boolean;
  sort_order: number | null;
  created_at: string;
};

export type Event = {
  id: string;
  title: string;
  description: string | null;
  event_type: string | null;
  status: 'draft' | 'published' | 'cancelled';
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  is_online: boolean;
  meeting_url: string | null;
  max_attendees: number | null;
  cover_image: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type PortfolioProject = {
  id: string;
  title: string;
  description: string | null;
  tags: string[] | null;
  image_url: string | null;
  project_url: string | null;
  github_url: string | null;
  category: string | null;
  featured: boolean;
  sort_order: number | null;
  created_at: string;
};

export type SupportTicket = {
  id: string;
  user_id: string;
  subject: string;
  message: string | null;
  category: string | null;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  email: string | null;
  created_at: string;
  updated_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string | null;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  link: string | null;
  created_at: string;
};

export type ActivityLog = {
  id: string;
  user_id: string;
  action: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type AdminConnection = {
  id: string;
  name: string;
  type: 'n8n' | 'database' | 'api' | 'webhook' | 'telegram_bot' | 'whatsapp_bot' | 'smtp';
  url: string | null;
  api_key_ref: string | null;
  config: Record<string, unknown> | null;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type CloudService = {
  name: string;
  status: 'running' | 'development' | 'degraded' | 'down';
};

export type ProjectCategory = 'event' | 'content' | 'business' | 'automation' | 'custom';

export type ProjectTier = 'basic' | 'standard' | 'expert' | 'advance' | 'custom';

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'not_required';

export type ProjectAutomation = {
  id: string;
  user_id: string;
  name: string;
  category: ProjectCategory;
  tier: ProjectTier;
  n8n_enabled: boolean;
  n8n_webhook_url: string | null;
  n8n_workflow_id: string | null;
  tagging_enabled: boolean;
  whatsapp_numbers: string[] | null;
  telegram_chat_ids: string[] | null;
  tagging_message_template: string | null;
  ai_agent_enabled: boolean;
  ai_provider: 'openai' | 'anthropic' | 'custom' | null;
  ai_api_key_ref: string | null;
  ai_model: string | null;
  ai_system_prompt: string | null;
  scheduler_enabled: boolean;
  schedule_cron: string | null;
  schedule_timezone: string;
  publisher_facebook: boolean;
  publisher_instagram: boolean;
  publisher_threads: boolean;
  publisher_tiktok: boolean;
  publisher_credentials: Record<string, unknown> | null;
  report_enabled: boolean;
  report_frequency: 'daily' | 'weekly' | 'monthly' | null;
  report_email: string | null;
  db_connection_enabled: boolean;
  db_host: string | null;
  db_port: number | null;
  db_name: string | null;
  db_user: string | null;
  db_password_ref: string | null;
  config: Record<string, unknown> | null;
  status: 'active' | 'paused' | 'archived';
  credit_tokens: number;
  tokens_used: number;
  review_status: ReviewStatus | null;
  review_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};
