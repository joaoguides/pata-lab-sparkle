export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          cep: string
          city: string
          complement: string | null
          created_at: string | null
          district: string
          id: string
          is_default: boolean | null
          name: string | null
          number: string
          phone: string | null
          state: string
          street: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cep: string
          city: string
          complement?: string | null
          created_at?: string | null
          district: string
          id?: string
          is_default?: boolean | null
          name?: string | null
          number: string
          phone?: string | null
          state: string
          street: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cep?: string
          city?: string
          complement?: string | null
          created_at?: string | null
          district?: string
          id?: string
          is_default?: boolean | null
          name?: string | null
          number?: string
          phone?: string | null
          state?: string
          street?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string | null
          id: string
          price: number
          quantity: number
          updated_at: string | null
          variant_id: string
        }
        Insert: {
          cart_id: string
          created_at?: string | null
          id?: string
          price: number
          quantity?: number
          updated_at?: string | null
          variant_id: string
        }
        Update: {
          cart_id?: string
          created_at?: string | null
          id?: string
          price?: number
          quantity?: number
          updated_at?: string | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "variants"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          coupon_id: string | null
          created_at: string | null
          id: string
          session_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          coupon_id?: string | null
          created_at?: string | null
          id?: string
          session_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          coupon_id?: string | null
          created_at?: string | null
          id?: string
          session_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carts_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          name: string
          parent_id: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          name: string
          parent_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string
          parent_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          active: boolean | null
          code: string
          created_at: string | null
          ends_at: string | null
          id: string
          minimum_amount: number | null
          starts_at: string | null
          type: Database["public"]["Enums"]["coupon_type"]
          updated_at: string | null
          usage_count: number | null
          usage_limit: number | null
          value: number
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string | null
          ends_at?: string | null
          id?: string
          minimum_amount?: number | null
          starts_at?: string | null
          type: Database["public"]["Enums"]["coupon_type"]
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          value: number
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string | null
          ends_at?: string | null
          id?: string
          minimum_amount?: number | null
          starts_at?: string | null
          type?: Database["public"]["Enums"]["coupon_type"]
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          value?: number
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string | null
          description: string | null
          enabled: boolean | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
          variant_id: string
          variant_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
          variant_id: string
          variant_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
          variant_id?: string
          variant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          discount: number | null
          email: string | null
          id: string
          notes: string | null
          number: number
          shipping_cost: number | null
          status: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          total: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          discount?: number | null
          email?: string | null
          id?: string
          notes?: string | null
          number?: number
          shipping_cost?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          total: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          discount?: number | null
          email?: string | null
          id?: string
          notes?: string | null
          number?: number
          shipping_cost?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number
          total?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          external_id: string | null
          id: string
          method: string
          order_id: string
          payload: Json | null
          provider: string
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          external_id?: string | null
          id?: string
          method: string
          order_id: string
          payload?: Json | null
          provider: string
          status: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          external_id?: string | null
          id?: string
          method?: string
          order_id?: string
          payload?: Json | null
          provider?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          birth_date: string | null
          created_at: string | null
          id: string
          name: string
          notes: string | null
          size: string | null
          species: Database["public"]["Enums"]["species"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          size?: string | null
          species: Database["public"]["Enums"]["species"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          size?: string | null
          species?: Database["public"]["Enums"]["species"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          category_id: string
          product_id: string
        }
        Insert: {
          category_id: string
          product_id: string
        }
        Update: {
          category_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          brand: string | null
          created_at: string | null
          description: string | null
          gtin: string | null
          id: string
          images: Json | null
          name: string
          rating_avg: number | null
          rating_count: number | null
          seo_description: string | null
          seo_title: string | null
          sku: string | null
          slug: string
          species: Database["public"]["Enums"]["species"]
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          brand?: string | null
          created_at?: string | null
          description?: string | null
          gtin?: string | null
          id?: string
          images?: Json | null
          name: string
          rating_avg?: number | null
          rating_count?: number | null
          seo_description?: string | null
          seo_title?: string | null
          sku?: string | null
          slug: string
          species: Database["public"]["Enums"]["species"]
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          brand?: string | null
          created_at?: string | null
          description?: string | null
          gtin?: string | null
          id?: string
          images?: Json | null
          name?: string
          rating_avg?: number | null
          rating_count?: number | null
          seo_description?: string | null
          seo_title?: string | null
          sku?: string | null
          slug?: string
          species?: Database["public"]["Enums"]["species"]
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          approved: boolean | null
          comment: string | null
          created_at: string | null
          id: string
          order_id: string | null
          product_id: string
          rating: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved?: boolean | null
          comment?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_id: string
          rating: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved?: boolean | null
          comment?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_id?: string
          rating?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping: {
        Row: {
          address_id: string
          carrier: string
          cost: number
          created_at: string | null
          eta_days: number | null
          id: string
          order_id: string
          service: string
          tracking_code: string | null
          updated_at: string | null
        }
        Insert: {
          address_id: string
          carrier: string
          cost: number
          created_at?: string | null
          eta_days?: number | null
          id?: string
          order_id: string
          service: string
          tracking_code?: string | null
          updated_at?: string | null
        }
        Update: {
          address_id?: string
          carrier?: string
          cost?: number
          created_at?: string | null
          eta_days?: number | null
          id?: string
          order_id?: string
          service?: string
          tracking_code?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipping_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipping_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      variants: {
        Row: {
          active: boolean | null
          attributes: Json | null
          compare_at_price: number | null
          created_at: string | null
          id: string
          name: string
          price: number
          product_id: string
          stock: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          attributes?: Json | null
          compare_at_price?: number | null
          created_at?: string | null
          id?: string
          name: string
          price: number
          product_id: string
          stock?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          attributes?: Json | null
          compare_at_price?: number | null
          created_at?: string | null
          id?: string
          name?: string
          price?: number
          product_id?: string
          stock?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_coupon: {
        Args: { p_cart: string; p_code: string }
        Returns: Json
      }
    }
    Enums: {
      coupon_type: "PERCENT" | "FIXED"
      order_status:
        | "PENDING"
        | "PAID"
        | "FULFILLING"
        | "SHIPPED"
        | "DELIVERED"
        | "CANCELED"
      species: "CACHORRO" | "GATO" | "GERAL"
      user_role: "ADMIN" | "CUSTOMER"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      coupon_type: ["PERCENT", "FIXED"],
      order_status: [
        "PENDING",
        "PAID",
        "FULFILLING",
        "SHIPPED",
        "DELIVERED",
        "CANCELED",
      ],
      species: ["CACHORRO", "GATO", "GERAL"],
      user_role: ["ADMIN", "CUSTOMER"],
    },
  },
} as const
