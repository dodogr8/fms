"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { FolderTree, Users, Sliders, Plus, Edit, Trash2 } from "lucide-react";

export default function SettingsPage() {
  // ເລືອກ Tab ທີ່ເປີດຢູ່ (Default ເປັນ categories)
  const [activeTab, setActiveTab] = useState<"categories" | "users" | "general">("categories");

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar userRole="ADMIN" />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="ການຕັ້ງຄ່າລະບົບ (System Settings)" userName="ຜູ້ບໍລິຫານລະບົບ" userRole="ADMIN" />

        <main className="p-6 space-y-6">
          {/* Header Card & Tabs Switcher */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">ສູນລວມການຕັ້ງຄ່າ</h2>
              <p className="text-xs text-slate-500 mt-1">ຈັດການຂໍ້ມູນໝວດໝູ່, ບັນຊີຜູ້ໃຊ້ງານ ແລະ ການຕັ້ງຄ່າທົ່ວໄປຂອງລະບົບ</p>
            </div>

            {/* ແຖບ Tabs ເລືອກເມນູ */}
            <div className="flex flex-wrap gap-2 border-b border-slate-100 pt-2">
              <button
                onClick={() => setActiveTab("categories")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "categories"
                    ? "bg-green-600 text-white shadow-md shadow-green-600/20"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <FolderTree className="w-4 h-4" />
                <span>ຈັດການໝວດໝູ່ (Categories)</span>
              </button>

              <button
                onClick={() => setActiveTab("users")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "users"
                    ? "bg-green-600 text-white shadow-md shadow-green-600/20"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>ຈັດການຜູ້ໃຊ້ງານ (Users)</span>
              </button>

              <button
                onClick={() => setActiveTab("general")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "general"
                    ? "bg-green-600 text-white shadow-md shadow-green-600/20"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>ຕັ້ງຄ່າທົ່ວໄປ (General)</span>
              </button>
            </div>
          </div>

          {/* Tab 1: ຈັດການໝວດໝູ່ */}
          {activeTab === "categories" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800">ໂຄງສ້າງໝວດໝູ່ (ລາຍຮັບ - ລາຍຈ່າຍ - ຊັບສິນ)</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm">
                  <Plus className="w-4 h-4" />
                  <span>ເພີ່ມໝວດໝູ່ໃໝ່</span>
                </button>
              </div>

              <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-sm">
                📌 ບ່ອນສະແດງ Tree List ໝວດໝູ່ (ດຽວເຮົາຈະເຊື່ອມກັບ API ດຶງຂໍ້ມູນ Categories ມາສະແດງ)
              </div>
            </div>
          )}

          {/* Tab 2: ຈັດການຜູ້ໃຊ້ງານ */}
          {activeTab === "users" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800">ລາຍຊື່ຜູ້ໃຊ້ງານ ແລະ ສິດທິການໃຊ້ງານ (4 Roles)</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm">
                  <Plus className="w-4 h-4" />
                  <span>ເພີ່ມຜູ້ໃຊ້ໃໝ່</span>
                </button>
              </div>

              <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-sm">
                📌 ບ່ອນສະແດງຕາຕະລາງຜູ້ໃຊ້ (Admin, Director, Finance Staff, Asset Staff)
              </div>
            </div>
          )}

          {/* Tab 3: ຕັ້ງຄ່າທົ່ວໄປ */}
          {activeTab === "general" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800">ຕັ້ງຄ່າຂໍ້ມູນຫ້ອງການ ແລະ ເອກະສານ</h3>
              
              <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-sm">
                📌 ບ່ອນຕັ້ງຄ່າຊື່ຫ້ອງການ, ຊື່ຫົວໜ້າກົມ ສຳລັບສະແດງໃນໃບບິນ ແລະ ບົດລາຍງານ
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}