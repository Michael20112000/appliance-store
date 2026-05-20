import {
  BarChart2,
  FolderTree,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
} from "lucide-react";

export const adminNavItems = [
  { href: "/admin", label: "Панель", icon: LayoutDashboard },
  { href: "/admin/kategorii", label: "Категорії", icon: FolderTree },
  { href: "/admin/tovary", label: "Товари", icon: Package },
  { href: "/admin/zamovlennia", label: "Замовлення", icon: ShoppingBag },
  { href: "/admin/chaty", label: "Чати", icon: MessageSquare },
  { href: "/admin/analityka", label: "Аналітика", icon: BarChart2 },
  { href: "/admin/nalashtuvannia", label: "Налаштування", icon: Settings },
] as const;
