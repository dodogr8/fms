"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { 
  Settings as SettingsIcon, 
  Users, 
  Database, 
  ShieldCheck, 
  FolderTree, 
  ChevronRight
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<"ADMIN" | "DIRECTOR" | "FINANCE_STAFF" | "ASSET_STAFF">("ADMIN");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.role) setUserRole(parsed.role);
      } catch (e) {
        console.error("Error parsing user role", e);
      }
    }
  }, []);

  return (
    <div className="flex w-full min-h-screen bg-slate-50 overflow-x-hidden">
      <Sidebar userRole={userRole} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Navbar 
          title="ຕັ້ງຄ່າລະບົບ (Settings)" 
          userName="ຜູ້ໃຊ້ງານລະບົບ" 
          userRole={userRole} 
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />

        <main className="p-6 space-y-6 w-full max-w-4xl overflow-hidden">
          {/* Header Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
              <SettingsIcon className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">ຕັ້ງຄ່າລະບົບ ແລະ ຈັດການຂໍ້ມູນພື້ນຖານ</h2>
              <p className="text-xs text-slate-500 mt-0.5">ຄຸ້ມຄອງໝວດໝູ່, ຜູ້ໃຊ້ງານລະບົບ ແລະ ຄວາມປອດໄພ</p>
            </div>
          </div>

          {/* Settings Grid Menu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. ຈັດການໝວດໝູ່ (Dynamic Categories) */}
            <Link 
              href="/settings/categories"
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-indigo-500 hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <FolderTree className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">ຈັດການໝວດໝູ່ & ໝວດໝູ່ຍ່ອຍ</h3>
                  <p className="text-xs text-slate-400 mt-0.5">ເພີ່ມ, ແກ້ໄຂ ໝວດໝູ່ລາຍຮັບ, ລາຍຈ່າຍ ແລະ ຊັບສິນ</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </Link>

            {/* 2. ຈັດການຜູ້ໃຊ້ງານ (Users Management) */}
            <Link 
              href="/settings/users"
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-blue-500 hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">ຈັດການສິດທິຜູ້ໃຊ້ງານ (Users)</h3>
                  <p className="text-xs text-slate-400 mt-0.5">ເພີ່ມ/ແກ້ໄຂ ຜູ້ໃຊ້, ກຳນົດສິດ ADMIN, DIRECTOR, FINANCE</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </Link>

            {/* 3. ສຳຮອງຂໍ້ມູນ (Database Backup) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between opacity-80">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">ສຳຮອງຂໍ້ມູນ (Database Backup)</h3>
                  <p className="text-xs text-slate-400 mt-0.5">ສຳຮອງ ແລະກູ້ຄືນຂໍ້ມູນ (Export JSON/SQL)</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-lg">ປອດໄພ</span>
            </div>

            {/* 4. ຄວາມປອດໄພລະບົບ (Security) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between opacity-80">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">ຄວາມປອດໄພ & ລະບົບ Log</h3>
                  <p className="text-xs text-slate-400 mt-0.5">ກວດສອບປະຫວັດການເຄື່ອນໄຫວ (Audit Trail)</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-lg">Active</span>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}