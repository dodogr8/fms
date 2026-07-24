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
  Settings, 
  LogOut,
  Building2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Briefcase,
  Box,
  FolderTree,
  Users
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

  // 💡 ດຶງ Role ຈາກ LocalStorage ອັດຕະໂນມັດ
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.role) {
          setCurrentRole(parsed.role);
        }
      } catch (e) {
        console.error("Error parsing user role from localStorage", e);
      }
    }
  }, [initialRole]);

  // 💡 ລາຍການເມນູທັງໝົດ (ເພີ່ມ ເມນູ ການຕັ້ງຄ່າ ກັບຄືນມາແລ້ວ)
  const navigation = [
    {
      title: "ໜ້າຫຼັກ",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["ADMIN", "DIRECTOR", "FINANCE_STAFF", "ASSET_STAFF"],
    },
    
    {
      title: "ລາຍຮັບ",
      href: "/incomes",
      icon: TrendingUp,
      roles: ["ADMIN", "DIRECTOR", "FINANCE_STAFF"],
    },
    {
      title: "ລາຍຈ່າຍ",
      href: "/expenses",
      icon: TrendingDown,
      roles: ["ADMIN", "DIRECTOR", "FINANCE_STAFF"],
    },
    {
      title: "ງົບປະມານໂຄງການ",
      href: "/budgets",
      icon: Briefcase,
      roles: ["ADMIN", "DIRECTOR", "FINANCE_STAFF"],
    },

    {
      title: "ສະຫຼຸບຍອດປະຈຳປີ",
      href: "/annual-summary",
      icon: Calendar,
      roles: ["ADMIN", "DIRECTOR", "FINANCE_STAFF"],
    },
    {
      title: "ຄຸ້ມຄອງຊັບສິນ",
      href: "/assets",
      icon: Box,
      roles: ["ADMIN", "DIRECTOR", "ASSET_STAFF"],
    },
    
    {
      title: "ລາຍງານ",
      href: "/reports",
      icon: PieChart,
      roles: ["ADMIN", "DIRECTOR", "FINANCE_STAFF"],
    },
    
    {
      title: "ການຕັ້ງຄ່າລະບົບ", // 💡 ເພີ່ມເມນູ ການຕັ້ງຄ່າ ກັບຄືນມາ
      href: "/settings",
      icon: Settings,
      roles: ["ADMIN"],
    },
  ];

  // 💡 Filter ເມນູຕາມ Role ຂອງຜູ້ໃຊ້
  const filteredNavigation = navigation.filter(
    (item) => !item.roles || item.roles.includes(currentRole)
  );

  return (
    <aside
      className={`bg-white border-r border-slate-200/80 min-h-screen flex flex-col justify-between p-4 transition-all duration-300 relative ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="space-y-6">
        {/* Header Logo */}
        <div className="flex items-center justify-between px-2">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 text-white rounded-xl shadow-md shadow-green-600/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-slate-800 text-sm leading-tight">
                  ລະບົບການເງິນ
                </h1>
                <p className="text-[10px] text-slate-400 font-medium">
                  Finance System
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all mx-auto"
            title={isCollapsed ? "ຂະຫຍາຍເມນູ" : "ຍໍ້ເມນູ"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {filteredNavigation.map((item) => {
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
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>ອອກຈາກລະບົບ</span>}
        </Link>
      </div>
    </aside>
  );
}