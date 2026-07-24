"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { showSuccess, showError, showConfirm } from "@/lib/swal";
import { 
  Calendar, 
  Wallet, 
  TrendingDown, 
  CheckCircle2, 
  Lock, 
  Unlock,
  RefreshCw,
  Building2,
  Coins,
  ArrowRight
} from "lucide-react";

interface ClosingRecord {
  id: number;
  year: number;
  regularIncome: number;
  totalExpense: number;
  endingBalance: number;
  isClosed: boolean;
  closedAt: string;
  closedBy: string;
}

export default function AnnualSummaryPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<"ADMIN" | "DIRECTOR" | "FINANCE_STAFF" | "ASSET_STAFF">("ADMIN");

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [loading, setLoading] = useState(false);

  const [summaryData, setSummaryData] = useState({
    regularIncomeTotal: 0,
    feeTotal: 0,
    serviceTotal: 0,
    totalExpense: 0,
    netBalance: 0,
    isClosed: false,
    closingHistory: [] as ClosingRecord[],
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.role) setUserRole(parsed.role);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    fetchAnnualData(selectedYear);
  }, [selectedYear]);

  const fetchAnnualData = async (year: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/annual-summary?year=${year}`);
      if (res.ok) {
        const data = await res.json();
        setSummaryData(data);
      }
    } catch (err) {
      console.error("Fetch Annual Data Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 💡 ຟັງຊັນ ປິດບັນຊີ / ຍົກເລີກການປິດບັນຊີ
  const handleToggleClose = async (isReopen: boolean = false) => {
    const actionText = isReopen ? "🔓 ຍົກເລີກການປິດບັນຊີ" : "🔒 ປິດບັນຊີ";
    const confirmMsg = isReopen
      ? `ທ່ານຕ້ອງການຍົກເລີກການປິດບັນຊີປີ ${selectedYear} ແທ້ຫຼືບໍ່? (ລະບົບຈະດຶງຍອດຍົກຍອດປີ ${selectedYear + 1} ອອກຊົ່ວຄາວ ເພື່ອໃຫ້ທ່ານແກ້ໄຂຂໍ້ມູນ)`
      : `ທ່ານຢືນຢັນທີ່ຈະປິດບັນຊີປີ ${selectedYear} ແລະ ຍົກຍອດເງິນເຫຼືອໄປເປັນລາຍຮັບຂອງປີ ${selectedYear + 1} ແທ້ຫຼືບໍ່?`;

    const confirmed = await showConfirm(confirmMsg, "Confirmation");
    if (!confirmed) return;

    setLoading(true);
    try {
      const savedUser = localStorage.getItem("user");
      let username = "ADMIN";
      if (savedUser) {
        try {
          username = JSON.parse(savedUser).username || "ADMIN";
        } catch (e) {}
      }

      const res = await fetch("/api/annual-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: selectedYear,
          action: isReopen ? "REOPEN" : "CLOSE",
          closedBy: username,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showSuccess(data.message);
        fetchAnnualData(selectedYear);
      } else {
        showError(data.message || "ເກີດຂໍ້ຜິດພາດ!");
      }
    } catch (err) {
      showError("ບໍ່ສາມາດເຊື່ອມຕໍ່ Server ໄດ້!");
    } finally {
      setLoading(false);
    }
  };

  const yearsList = Array.from({ length: 7 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="flex w-full min-h-screen bg-slate-50 overflow-x-hidden">
      <Sidebar userRole={userRole} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Navbar 
          title="ສະຫຼຸບຍອດປະຈຳປີ & ເງິນຍົກຍອດ (Annual Closing)" 
          userName="ຜູ້ໃຊ້ງານລະບົບ" 
          userRole={userRole} 
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />

        <main className="p-6 space-y-6 w-full max-w-full overflow-hidden">
          {/* Header & Year Selector */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                <Calendar className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">ສະຫຼຸບງົບປະມານປະຈຳປີ {selectedYear}</h2>
                <p className="text-xs text-slate-500 font-medium">ເລືອກປີເພື່ອຕິດຕາມຍອດເງິນເຫຼືອ ແລະ ປິດ/ແກ້ໄຂ ບັນຊີຍົກຍອດ</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-600 whitespace-nowrap">ເລືອກປີງົບປະມານ:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                {yearsList.map((y) => (
                  <option key={y} value={y}>
                    ປີງົບປະມານ {y}
                  </option>
                ))}
              </select>

              <button
                onClick={() => fetchAnnualData(selectedYear)}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
                title="ໂຫຼດຂໍ້ມູນໃໝ່"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* 4 Cards Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ລາຍຮັບບໍລິຫານປີ {selectedYear}</span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-emerald-600">{summaryData.regularIncomeTotal.toLocaleString()} ກີບ</h3>
              <p className="text-[11px] text-slate-400 font-medium">* ລວມເງິນຍົກຍອດມາ + ເງິນບໍລິຫານໂຄງການ</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ລາຍຈ່າຍລວມປີ {selectedYear}</span>
                <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                  <TrendingDown className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-red-600">{summaryData.totalExpense.toLocaleString()} ກີບ</h3>
              <p className="text-[11px] text-slate-400 font-medium">* ຍອດລວມການເບີກຈ່າຍຕົວຈິງໃນປີ</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ເງິນເຫຼືອສຸດທິປີ {selectedYear}</span>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Coins className="w-5 h-5" />
                </div>
              </div>
              <h3 className={`text-2xl font-black ${summaryData.netBalance >= 0 ? "text-blue-600" : "text-red-600"}`}>
                {summaryData.netBalance.toLocaleString()} ກີບ
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">* ເງິນທີ່ຈະຍົກໄປເປັນລາຍຮັບປີ {selectedYear + 1}</p>
            </div>

            {/* Card 4: ປຸ່ມກົດປິດ / ຍົກເລີກການປິດ */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ສະຖານະບັນຊີ</span>
                {summaryData.isClosed ? (
                  <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ປິດບັນຊີແລ້ວ
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> ຍັງບໍ່ທັນປິດ
                  </span>
                )}
              </div>

              {userRole !== "DIRECTOR" && (
                <div className="space-y-1.5">
                  {summaryData.isClosed ? (
                    <button
                      onClick={() => handleToggleClose(true)}
                      disabled={loading}
                      className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20"
                    >
                      <Unlock className="w-4 h-4" />
                      <span>🔓 ຍົກເລີກການປິດບັນຊີ ເພື່ອແກ້ໄຂ</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleClose(false)}
                      disabled={loading}
                      className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20"
                    >
                      <Lock className="w-4 h-4" />
                      <span>🔒 ປິດບັນຊີປີ {selectedYear} & ຍົກຍອດ</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Reference Info */}
          <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-slate-500" />
              <div>
                <span className="font-bold text-slate-800">ຍອດເງິນຕິດຕາມພັນທະ (ບໍ່ນຳມາບວກເປັນເງິນເຫຼືອໃຊ້ຈ່າຍ):</span>
                <p className="text-slate-500 text-[11px]">ຄ່າທຳນຽມຕ້ອງມອບເຂົ້າງົບປະມານລັດ ແລະ ຄ່າບໍລິການຂຶ້ນແຜນປີຕໍ່ໄປ</p>
              </div>
            </div>
            <div className="flex gap-6 font-bold">
              <span className="text-blue-700">🏛️ ຄ່າທຳນຽມ (ມອບລັດ): {summaryData.feeTotal.toLocaleString()} ກີບ</span>
              <span className="text-purple-700">💼 ຄ່າບໍລິການ (ວິຊາການ): {summaryData.serviceTotal.toLocaleString()} ກີບ</span>
            </div>
          </div>

          {/* Closing History Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-slate-800 text-base">📋 ປະຫວັດການປິດບັນຊີປະຈຳປີ (Closing History)</h3>

            <div className="w-full overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-sm text-slate-600 border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-4 text-center">ປີງົບປະມານ</th>
                    <th className="py-3.5 px-4 text-right">ລາຍຮັບບໍລິຫານ (ກີບ)</th>
                    <th className="py-3.5 px-4 text-right">ລາຍຈ່າຍລວມ (ກີບ)</th>
                    <th className="py-3.5 px-4 text-right">ເງິນເຫຼືອຍົກຍອດ (ກີບ)</th>
                    <th className="py-3.5 px-4 text-center">ໂອນໄປປີ</th>
                    <th className="py-3.5 px-4 text-center">ສະຖານະ</th>
                    <th className="py-3.5 px-4 text-center">ຜູ້ປິດບັນຊີ / ວັນທີ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {summaryData.closingHistory && summaryData.closingHistory.length > 0 ? (
                    summaryData.closingHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 text-center font-bold text-blue-700">ປີ {item.year}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                          {Number(item.regularIncome || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-red-600">
                          {Number(item.totalExpense || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-slate-900">
                          {Number(item.endingBalance || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                            ປີ {item.year + 1} <ArrowRight className="w-3 h-3" />
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {item.isClosed ? (
                            <span className="px-2.5 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-lg">
                              🔒 ປິດບັນຊີແລ້ວ
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg">
                              🔓 ເປີດຢູ່ (ແກ້ໄຂໄດ້)
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center text-xs text-slate-500">
                          <p className="font-bold text-slate-700">{item.closedBy || "ADMIN"}</p>
                          <p className="text-[10px] text-slate-400">
                            {item.closedAt ? new Date(item.closedAt).toLocaleDateString("la-LA") : "-"}
                          </p>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        ຍັງບໍ່ທັນມີປະຫວັດການປິດບັນຊີປະຈຳປີ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}