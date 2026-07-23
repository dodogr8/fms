"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Package, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  FolderKanban
} from "lucide-react";

interface DashboardData {
  summary: {
    totalIncomes: number;
    totalExpenses: number;
    balance: number;
    totalBudgets: number;
    totalAssetsValue: number;
    assetsCount: number;
  };
  recentTransactions: Array<{
    id: string;
    type: "income" | "expense";
    title: string;
    date: string;
    amount: number;
    refNo: string;
  }>;
  budgets: Array<{
    id: number;
    projectName: string;
    netAmount: number;
    usedAmount: number;
  }>;
}

export default function DashboardPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error("Fetch Dashboard Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const summary = data?.summary || {
    totalIncomes: 0,
    totalExpenses: 0,
    balance: 0,
    totalBudgets: 0,
    totalAssetsValue: 0,
    assetsCount: 0,
  };

  return (
    <div className="flex w-full min-h-screen bg-slate-50 overflow-x-hidden">
      <Sidebar 
        userRole="ADMIN" 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Navbar 
          title="ໜ້າຫຼັກ (Dashboard)" 
          userName="ຜູ້ບໍລິຫານລະບົບ" 
          userRole="ADMIN" 
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />

        <main className="p-6 space-y-6 w-full max-w-full overflow-hidden">
          {/* Summary Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: ຍອດເຫຼືອຄັງ */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ຍອດເຫຼືອຄັງເງິນ</span>
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  {loading ? "..." : summary.balance.toLocaleString()} ກີບ
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">ລາຍຮັບລວມ - ລາຍຈ່າຍລວມ</p>
              </div>
            </div>

            {/* Card 2: ລາຍຮັບລວມ */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ລາຍຮັບລວມ</span>
                <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-green-700">
                  {loading ? "..." : summary.totalIncomes.toLocaleString()} ກີບ
                </h3>
                <p className="text-[11px] text-green-600 font-semibold mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" /> ຂໍ້ມູນ Realtime ຈາກ DB
                </p>
              </div>
            </div>

            {/* Card 3: ລາຍຈ່າຍລວມ */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ລາຍຈ່າຍລວມ</span>
                <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
                  <TrendingDown className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-red-600">
                  {loading ? "..." : summary.totalExpenses.toLocaleString()} ກີບ
                </h3>
                <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                  <ArrowDownRight className="w-3.5 h-3.5" /> ຂໍ້ມູນ Realtime ຈາກ DB
                </p>
              </div>
            </div>

            {/* Card 4: ມູນຄ່າຊັບສິນລວມ */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ມູນຄ່າຊັບສິນລັດ</span>
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                  <Package className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  {loading ? "..." : summary.totalAssetsValue.toLocaleString()} ກີບ
                </h3>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">
                  ທັງໝົດ {summary.assetsCount} ລາຍການ
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: ງົບປະມານໂຄງການ & ລາຍການເຄື່ອນໄຫວລ່າສຸດ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* ງົບປະມານໂຄງການ */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-green-600" />
                  ສະຫຼຸບຄວາມຄືບໜ້າງົບປະມານໂຄງການ
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  ລວມ: {summary.totalBudgets.toLocaleString()} ກີບ
                </span>
              </div>

              <div className="space-y-4">
                {data?.budgets && data.budgets.length > 0 ? (
                  data.budgets.map((b) => {
                    const net = Number(b.netAmount);
                    const used = Number(b.usedAmount);
                    const percent = net > 0 ? Math.round((used / net) * 100) : 0;
                    return (
                      <div key={b.id} className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                        <div className="flex justify-between text-xs font-bold text-slate-800">
                          <span>{b.projectName}</span>
                          <span className={percent >= 90 ? "text-red-600" : "text-green-700"}>
                            {used.toLocaleString()} / {net.toLocaleString()} ກີບ ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${percent >= 90 ? 'bg-red-500' : 'bg-green-600'} rounded-full`}
                            style={{ width: `${percent > 100 ? 100 : percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center py-8 text-xs text-slate-400">ບໍ່ມີຂໍ້ມູນໂຄງການງົບປະມານ</p>
                )}
              </div>
            </div>

            {/* ລາຍການເຄື່ອນໄຫວລ່າສຸດ */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  ເຄື່ອນໄຫວລ່າສຸດ
                </h3>
              </div>

              <div className="space-y-3">
                {data?.recentTransactions && data.recentTransactions.length > 0 ? (
                  data.recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-800 line-clamp-1">{tx.title}</p>
                        <p className="text-[10px] text-slate-400">{tx.date} | ເລກບິນ: {tx.refNo}</p>
                      </div>
                      <span className={`font-black whitespace-nowrap ml-2 ${tx.type === 'income' ? 'text-green-700' : 'text-red-600'}`}>
                        {tx.type === 'income' ? '+' : '-'}{Number(tx.amount).toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-xs text-slate-400">ບໍ່ມີເຄື່ອນໄຫວລ່າສຸດ</p>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}