"use client";

import { Bell, Shield, Menu } from "lucide-react";

interface NavbarProps {
  title?: string;
  userName?: string;
  userRole?: string;
  onToggleSidebar?: () => void;
}

export default function Navbar({ 
  title = "ໜ້າຫຼັກ (Dashboard)", 
  userName = "ທ່ານ ສົມໄຊ ວິໄລສັກ", 
  userRole = "ADMIN",
  onToggleSidebar
}: NavbarProps) {
  
  const getRoleText = (role: string) => {
    switch (role) {
      case "ADMIN": return "ຜູ້ເບິ່ງແຍງລະບົບ";
      case "DIRECTOR": return "ຫົວໜ້າກົມ";
      case "FINANCE_STAFF": return "ພະນັກງານການເງິນ";
      case "ASSET_STAFF": return "ພະນັກງານຊັບສິນ";
      default: return "ພະນັກງານ";
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {/* ປຸ່ມ Menu Toggle ເທິງ Navbar */}
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
            title="ຊ່ອນ/ສະແດງ ເມນູ"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-lg font-bold text-slate-800">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl relative transition-all">
          <Bell className="w-5 h-5" />
          <span className="w-2 h-2 bg-green-500 rounded-full absolute top-2 right-2 ring-2 ring-white" />
        </button>

        <div className="h-6 w-px bg-slate-200" />

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-100 text-green-700 rounded-xl flex items-center justify-center font-bold text-sm border border-green-200">
            {userName.charAt(0)}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-slate-800 leading-tight">{userName}</p>
            <div className="flex items-center gap-1 text-[11px] text-green-600 font-medium mt-0.5">
              <Shield className="w-3 h-3" />
              <span>{getRoleText(userRole)}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}