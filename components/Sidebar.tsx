"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Package, 
  FileText, 
  Settings, 
  LogOut,
  Building2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface SidebarProps {
  userRole?: string;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export default function Sidebar({ 
  userRole: initialRole, 
  isCollapsed, 
  setIsCollapsed 
}: SidebarProps) {
  const pathname = usePathname();
  const [currentRole, setCurrentRole] = useState<string>(initialRole || "FINANCE_STAFF");

  // 💡 ດຶງ Role ຈາກ LocalStorage ອັດຕະໂນມັດ ຕອນເປີດໜ້າຈໍ
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.role) {
          setCurrentRole(parsed.role);
        }
      } catch (e) {
        console.error("Error reading role from localStorage", e);
      }
    }
  }, [initialRole]);

  // ກຳນົດສິດທິການເຫັນເມນູ
  const menuItems = [
    {
      title: "ໜ້າຫຼັກ",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["ADMIN", "DIRECTOR", "FINANCE_STAFF", "ASSET_STAFF"],
    },
    {
      title: "ຈັດການລາຍຮັບ",
      href: "/incomes",
      icon: TrendingUp,
      roles: ["ADMIN", "DIRECTOR", "FINANCE_STAFF"],
    },
    {
      title: "ຈັດການລາຍຈ່າຍ",
      href: "/expenses",
      icon: TrendingDown,
      roles: ["ADMIN", "DIRECTOR", "FINANCE_STAFF"],
    },
    {
      title: "ຄຸ້ມຄອງງົບປະມານ",
      href: "/budgets",
      icon: PieChart,
      roles: ["ADMIN", "DIRECTOR", "FINANCE_STAFF"],
    },
    {
      title: "ຄຸ້ມຄອງຊັບສິນ",
      href: "/assets",
      icon: Package,
      roles: ["ADMIN", "DIRECTOR", "ASSET_STAFF"],
    },
    {
      title: "ອອກບົດລາຍງານ",
      href: "/reports",
      icon: FileText,
      roles: ["ADMIN", "DIRECTOR", "FINANCE_STAFF", "ASSET_STAFF"],
    },
    {
      title: "ການຕັ້ງຄ່າລະບົບ",
      href: "/settings",
      icon: Settings,
      roles: ["ADMIN"], // 🔒 ສະເພາະ ADMIN ເທົ່ານັ້ນ! (DIRECTOR, FINANCE, ASSET ຈະບໍ່ເຫັນ)
    },
  ];

  // ກັ່ນຕອງເມນູຕາມ Role ຕົວຈິງ
  const filteredMenu = menuItems.filter((item) => item.roles.includes(currentRole));

  return (
    <aside 
      style={{ width: isCollapsed ? '80px' : '256px' }}
      className="bg-white border-r border-slate-200 shrink-0 min-h-screen flex flex-col justify-between p-3 sticky top-0 h-screen transition-all duration-300 relative z-20"
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-7 bg-white border border-slate-200 text-slate-600 hover:text-green-600 p-1.5 rounded-full shadow-md z-30 hover:scale-110 transition-all"
        title={isCollapsed ? "ຂະຫຍາຍເມນູ" : "ເຊື່ອງເມນູ"}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div>
        <div className={`flex items-center gap-3 px-2 py-3 mb-6 border-b border-slate-100 ${isCollapsed ? "justify-center" : ""}`}>
          <div className="p-2.5 bg-green-600 text-white rounded-xl shadow-md shadow-green-600/20 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden transition-all whitespace-nowrap">
              <h1 className="font-bold text-base text-slate-900 tracking-wide">GFMS ONLINE</h1>
              <p className="text-[10px] text-green-700 font-semibold uppercase tracking-wider">ລະບົບການເງິນຫ້ອງການ</p>
            </div>
          )}
        </div>

        <nav className="space-y-1.5">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.title : ""}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                  isCollapsed ? "justify-center" : ""
                } ${
                  isActive
                    ? "bg-green-50 text-green-700 font-semibold shadow-sm border border-green-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-green-600" : "text-slate-400"}`} />
                {!isCollapsed && <span className="truncate whitespace-nowrap">{item.title}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <Link
          href="/login"
          title={isCollapsed ? "ອອກຈາກລະບົບ" : ""}
          className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="w-5 h-5 text-red-500 shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">ອອກຈາກລະບົບ</span>}
        </Link>
      </div>
    </aside>
  );
}