export type VitrineCourse = {
  id: string;
  title: string;
  short_description: string | null;
  full_description?: string | null;
  sales_description?: string | null;
  cover_image_url: string | null;
  banner_image_url?: string | null;
  price?: number;
  promotional_price?: number | null;
  benefits?: string[];
  total_lessons?: number;
  total_duration?: string | null;
  product_type?: string;
  category_name?: string | null;
  checkout_url?: string | null;
  sales_page_url?: string | null;
  access_state?: string;
  progress_pct?: number;
  badge_text?: string;
  launch_date?: string | null;
  is_enrolled?: boolean;
  display_title?: string;
  display_subtitle?: string;
  banner_link_url?: string | null;
};

export type VitrineShelf = {
  id: string;
  name: string;
  sort_order: number;
  shelf_type?: "admin" | "smart";
  courses: VitrineCourse[];
};