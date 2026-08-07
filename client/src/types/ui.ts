export interface ToastMessage {
  message: string;
  type: "info" | "success" | "error" | "cart" | "wishlist";
}

export type ThemeMode = "light" | "dark";
