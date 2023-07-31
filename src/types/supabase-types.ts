export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      account_user: {
        Row: {
          user_id: string;
          account_id: string;
          account_role: Database["public"]["Enums"]["account_role"];
        };
        Insert: {
          user_id: string;
          account_id: string;
          account_role: Database["public"]["Enums"]["account_role"];
        };
        Update: {
          user_id?: string;
          account_id?: string;
          account_role?: Database["public"]["Enums"]["account_role"];
        };
      };
      accounts: {
        Row: {
          team_name: string | null;
          updated_at: string | null;
          created_at: string | null;
          id: string;
          primary_owner_user_id: string;
          personal_account: boolean;
        };
        Insert: {
          team_name?: string | null;
          updated_at?: string | null;
          created_at?: string | null;
          id?: string;
          primary_owner_user_id?: string;
          personal_account?: boolean;
        };
        Update: {
          team_name?: string | null;
          updated_at?: string | null;
          created_at?: string | null;
          id?: string;
          primary_owner_user_id?: string;
          personal_account?: boolean;
        };
      };
      billing_customers: {
        Row: {
          account_id: string;
          customer_id: string | null;
          email: string | null;
          active: boolean | null;
          provider: Database["public"]["Enums"]["billing_providers"] | null;
        };
        Insert: {
          account_id: string;
          customer_id?: string | null;
          email?: string | null;
          active?: boolean | null;
          provider?: Database["public"]["Enums"]["billing_providers"] | null;
        };
        Update: {
          account_id?: string;
          customer_id?: string | null;
          email?: string | null;
          active?: boolean | null;
          provider?: Database["public"]["Enums"]["billing_providers"] | null;
        };
      };
      billing_prices: {
        Row: {
          id: string;
          billing_product_id: string | null;
          active: boolean | null;
          description: string | null;
          unit_amount: number | null;
          currency: string | null;
          type: Database["public"]["Enums"]["pricing_type"] | null;
          interval: Database["public"]["Enums"]["pricing_plan_interval"] | null;
          interval_count: number | null;
          trial_period_days: number | null;
          metadata: Json | null;
          provider: Database["public"]["Enums"]["billing_providers"] | null;
        };
        Insert: {
          id: string;
          billing_product_id?: string | null;
          active?: boolean | null;
          description?: string | null;
          unit_amount?: number | null;
          currency?: string | null;
          type?: Database["public"]["Enums"]["pricing_type"] | null;
          interval?:
            | Database["public"]["Enums"]["pricing_plan_interval"]
            | null;
          interval_count?: number | null;
          trial_period_days?: number | null;
          metadata?: Json | null;
          provider?: Database["public"]["Enums"]["billing_providers"] | null;
        };
        Update: {
          id?: string;
          billing_product_id?: string | null;
          active?: boolean | null;
          description?: string | null;
          unit_amount?: number | null;
          currency?: string | null;
          type?: Database["public"]["Enums"]["pricing_type"] | null;
          interval?:
            | Database["public"]["Enums"]["pricing_plan_interval"]
            | null;
          interval_count?: number | null;
          trial_period_days?: number | null;
          metadata?: Json | null;
          provider?: Database["public"]["Enums"]["billing_providers"] | null;
        };
      };
      billing_products: {
        Row: {
          id: string;
          active: boolean | null;
          name: string | null;
          description: string | null;
          image: string | null;
          metadata: Json | null;
          provider: Database["public"]["Enums"]["billing_providers"] | null;
        };
        Insert: {
          id: string;
          active?: boolean | null;
          name?: string | null;
          description?: string | null;
          image?: string | null;
          metadata?: Json | null;
          provider?: Database["public"]["Enums"]["billing_providers"] | null;
        };
        Update: {
          id?: string;
          active?: boolean | null;
          name?: string | null;
          description?: string | null;
          image?: string | null;
          metadata?: Json | null;
          provider?: Database["public"]["Enums"]["billing_providers"] | null;
        };
      };
      billing_subscriptions: {
        Row: {
          id: string;
          account_id: string;
          status: Database["public"]["Enums"]["subscription_status"] | null;
          metadata: Json | null;
          price_id: string | null;
          quantity: number | null;
          cancel_at_period_end: boolean | null;
          provider: Database["public"]["Enums"]["billing_providers"] | null;
          created: string;
          current_period_start: string;
          current_period_end: string;
          ended_at: string | null;
          cancel_at: string | null;
          canceled_at: string | null;
          trial_start: string | null;
          trial_end: string | null;
        };
        Insert: {
          id: string;
          account_id: string;
          status?: Database["public"]["Enums"]["subscription_status"] | null;
          metadata?: Json | null;
          price_id?: string | null;
          quantity?: number | null;
          cancel_at_period_end?: boolean | null;
          provider?: Database["public"]["Enums"]["billing_providers"] | null;
          created?: string;
          current_period_start?: string;
          current_period_end?: string;
          ended_at?: string | null;
          cancel_at?: string | null;
          canceled_at?: string | null;
          trial_start?: string | null;
          trial_end?: string | null;
        };
        Update: {
          id?: string;
          account_id?: string;
          status?: Database["public"]["Enums"]["subscription_status"] | null;
          metadata?: Json | null;
          price_id?: string | null;
          quantity?: number | null;
          cancel_at_period_end?: boolean | null;
          provider?: Database["public"]["Enums"]["billing_providers"] | null;
          created?: string;
          current_period_start?: string;
          current_period_end?: string;
          ended_at?: string | null;
          cancel_at?: string | null;
          canceled_at?: string | null;
          trial_start?: string | null;
          trial_end?: string | null;
        };
      };
      did_documents: {
        Row: {
          name: string | null;
          document: Json | null;
          account_id: string;
          id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name?: string | null;
          document?: Json | null;
          account_id: string;
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string | null;
          document?: Json | null;
          account_id?: string;
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      invitations: {
        Row: {
          account_role: Database["public"]["Enums"]["account_role"];
          account_id: string;
          invited_by_user_id: string;
          account_team_name: string | null;
          updated_at: string | null;
          created_at: string | null;
          id: string;
          token: string;
          invitation_type: Database["public"]["Enums"]["invitation_type"];
        };
        Insert: {
          account_role: Database["public"]["Enums"]["account_role"];
          account_id: string;
          invited_by_user_id: string;
          account_team_name?: string | null;
          updated_at?: string | null;
          created_at?: string | null;
          id?: string;
          token?: string;
          invitation_type: Database["public"]["Enums"]["invitation_type"];
        };
        Update: {
          account_role?: Database["public"]["Enums"]["account_role"];
          account_id?: string;
          invited_by_user_id?: string;
          account_team_name?: string | null;
          updated_at?: string | null;
          created_at?: string | null;
          id?: string;
          token?: string;
          invitation_type?: Database["public"]["Enums"]["invitation_type"];
        };
      };
      profiles: {
        Row: {
          id: string;
          name: string | null;
          updated_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          name?: string | null;
          updated_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          updated_at?: string | null;
          created_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_invitation: {
        Args: { lookup_invitation_token: string };
        Returns: string;
      };
      current_user_account_role: {
        Args: { lookup_account_id: string };
        Returns: Json;
      };
      get_account_billing_status: {
        Args: { lookup_account_id: string };
        Returns: Json;
      };
      get_service_role_config: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      lookup_invitation: {
        Args: { lookup_invitation_token: string };
        Returns: Json;
      };
      update_account_user_role: {
        Args: {
          account_id: string;
          user_id: string;
          new_account_role: Database["public"]["Enums"]["account_role"];
          make_primary_owner: boolean;
        };
        Returns: undefined;
      };
    };
    Enums: {
      account_role: "owner" | "member";
      billing_providers: "stripe";
      invitation_type: "one-time" | "24-hour";
      pricing_plan_interval: "day" | "week" | "month" | "year";
      pricing_type: "one_time" | "recurring";
      subscription_status:
        | "trialing"
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "unpaid";
    };
  };
}
