"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { ArrowUpRight, ArrowDownRight, Wallet, DollarSign } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar ດ້ານຂ້າງ */}
      <Sidebar userRole="ADMIN" />

      {/* ເນື້ອຫາຫຼັກ */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="ພາບລວມການເງິນ" userName="ຜູ້ບໍລິຫານລະບົບ" userRole="ADMIN" />

        <main className="p-6 space-y-6">
          {/* Card ສະຫຼຸບຕົວເລກ 4 ກ່ອງ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* ລາຍຮັບລວມ */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ລາຍຮັບລວມປີນີ້</span>
                <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">125,400,000 ກີບ</h3>
                <p className="text-xs text-green-600 font-medium mt-1">↑ +12.5% ຈາກເດືອນຜ່ານມາ</p>
              </div>
            </div>

            {/* ລາຍຈ່າຍລວມ */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ລາຍຈ່າຍລວມປີນີ້</span>
                <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">45,200,000 ກີບ</h3>
                <p className="text-xs text-red-500 font-medium mt-1">↓ ຢູ່ໃນເກນງົບປະມານ</p>
              </div>
            </div>

            {/* ຍອດເຫຼືອໃນຄັງ */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ຍອດເຫຼືອຄັງສິນລະບົບ</span>
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-green-700">80,200,000 ກີບ</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">ຍອດເຫຼືອໃຊ້ໄດ້ຈິງ</p>
              </div>
            </div>

            {/* ຄ່າທຳນຽມ/ບໍລິການ */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ລາຍຮັບວິຊາການ/ຄ່າທຳນຽມ</span>
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">18,500,000 ກີບ</h3>
                <p className="text-xs text-purple-600 font-medium mt-1">ຄ່າທຳນຽມ & ຄ່າບໍລິການ</p>
              </div>
            </div>
          </div>

          {/* ພື້ນທີ່ສະແດງກຣາບ ແລະ ຕາຕະລາງລາຍການລ້າສຸດ */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm min-h-[300px] flex items-center justify-center text-slate-400">
            📌 ບ່ອນສະແດງກຣາບສະຖິຕິ ແລະ ຕາຕະລາງເຄື່ອນໄຫວລ້າສຸດ (ດຽວເຮົາຈະມາໃສ່ຂໍ້ມູນຈິງຂັ້ນຕອນຕໍ່ໄປ)
          </div>
        </main>
      </div>
    </div>
  );
}