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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          check_in_latitude: number | null
          check_in_longitude: number | null
          check_in_time: string | null
          check_out_latitude: number | null
          check_out_longitude: number | null
          check_out_time: string | null
          created_at: string | null
          id: string
          notes: string | null
          photo_url: string | null
          student_id: string | null
          tutor_id: string
        }
        Insert: {
          check_in_latitude?: number | null
          check_in_longitude?: number | null
          check_in_time?: string | null
          check_out_latitude?: number | null
          check_out_longitude?: number | null
          check_out_time?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          photo_url?: string | null
          student_id?: string | null
          tutor_id: string
        }
        Update: {
          check_in_latitude?: number | null
          check_in_longitude?: number | null
          check_in_time?: string | null
          check_out_latitude?: number | null
          check_out_longitude?: number | null
          check_out_time?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          photo_url?: string | null
          student_id?: string | null
          tutor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          created_at: string | null
          id: string
          status: string | null
          student_id: string
          subject: Database["public"]["Enums"]["subject_area"] | null
          tutor_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: string | null
          student_id: string
          subject?: Database["public"]["Enums"]["subject_area"] | null
          tutor_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: string | null
          student_id?: string
          subject?: Database["public"]["Enums"]["subject_area"] | null
          tutor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string | null
          district_code: string | null
          email: string
          full_name: string
          grade: string | null
          id: string
          latitude: number | null
          longitude: number | null
          phone: string
          province_code: string | null
          regency_code: string | null
          school_name: string | null
          updated_at: string | null
          village_code: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          district_code?: string | null
          email: string
          full_name: string
          grade?: string | null
          id: string
          latitude?: number | null
          longitude?: number | null
          phone: string
          province_code?: string | null
          regency_code?: string | null
          school_name?: string | null
          updated_at?: string | null
          village_code?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          district_code?: string | null
          email?: string
          full_name?: string
          grade?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          phone?: string
          province_code?: string | null
          regency_code?: string | null
          school_name?: string | null
          updated_at?: string | null
          village_code?: string | null
        }
        Relationships: []
      }
      subjects: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tutor_approval_history: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          created_data: Json | null
          id: string
          notes: string | null
          tutor_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_data?: Json | null
          id?: string
          notes?: string | null
          tutor_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_data?: Json | null
          id?: string
          notes?: string | null
          tutor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutor_approval_history_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutor_approval_history_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tutor_details: {
        Row: {
          approved_at: string | null
          certificate_links: string[] | null
          created_at: string | null
          cv_link: string | null
          experience: string | null
          graduation_year: number | null
          hourly_rate: number | null
          id: string
          ipk: number | null
          is_approved: boolean | null
          is_available: boolean | null
          ktp_link: string | null
          major: string | null
          rejection_reason: string | null
          subjects: Database["public"]["Enums"]["subject_area"][]
          tutor_id: string
          university: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          certificate_links?: string[] | null
          created_at?: string | null
          cv_link?: string | null
          experience?: string | null
          graduation_year?: number | null
          hourly_rate?: number | null
          id?: string
          ipk?: number | null
          is_approved?: boolean | null
          is_available?: boolean | null
          ktp_link?: string | null
          major?: string | null
          rejection_reason?: string | null
          subjects?: Database["public"]["Enums"]["subject_area"][]
          tutor_id: string
          university?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          certificate_links?: string[] | null
          created_at?: string | null
          cv_link?: string | null
          experience?: string | null
          graduation_year?: number | null
          hourly_rate?: number | null
          id?: string
          ipk?: number | null
          is_approved?: boolean | null
          is_available?: boolean | null
          ktp_link?: string | null
          major?: string | null
          rejection_reason?: string | null
          subjects?: Database["public"]["Enums"]["subject_area"][]
          tutor_id?: string
          university?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tutor_details_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tutor_rejection_history: {
        Row: {
          created_at: string | null
          id: string
          rejected_at: string | null
          rejection_reason: string
          resubmitted_at: string | null
          tutor_id: string
          updated_data: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          rejected_at?: string | null
          rejection_reason: string
          resubmitted_at?: string | null
          tutor_id: string
          updated_data?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          rejected_at?: string | null
          rejection_reason?: string
          resubmitted_at?: string | null
          tutor_id?: string
          updated_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "tutor_rejection_history_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_get_all_enrollments: {
        Args: never
        Returns: {
          created_at: string
          id: string
          status: string
          student_id: string
          subject: string
          tutor_id: string
        }[]
      }
      admin_get_all_tutor_details: {
        Args: never
        Returns: {
          approved_at: string
          certificate_links: string[]
          created_at: string
          cv_link: string
          experience: string
          graduation_year: number
          hourly_rate: number
          id: string
          ipk: number
          is_approved: boolean
          is_available: boolean
          ktp_link: string
          major: string
          rejection_reason: string
          subjects: Database["public"]["Enums"]["subject_area"][]
          tutor_id: string
          university: string
          updated_at: string
        }[]
      }
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      get_public_tutor_profiles: {
        Args: never
        Returns: {
          address: string
          experience: string
          full_name: string
          hourly_rate: number
          id: string
          is_available: boolean
          latitude: number
          longitude: number
          subjects: Database["public"]["Enums"]["subject_area"][]
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "tutor" | "student"
      subject_area:
        | "matematika"
        | "fisika"
        | "kimia"
        | "biologi"
        | "bahasa_indonesia"
        | "bahasa_inggris"
        | "ekonomi"
        | "akuntansi"
        | "sejarah"
        | "geografi"
        | "sosiologi"
        | "pkn"
      user_role: "admin" | "tutor" | "student"
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
      app_role: ["admin", "tutor", "student"],
      subject_area: [
        "matematika",
        "fisika",
        "kimia",
        "biologi",
        "bahasa_indonesia",
        "bahasa_inggris",
        "ekonomi",
        "akuntansi",
        "sejarah",
        "geografi",
        "sosiologi",
        "pkn",
      ],
      user_role: ["admin", "tutor", "student"],
    },
  },
} as const
