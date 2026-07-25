"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Briefcase, 
  Search,
  Calendar,
  Plus,
  Activity,
  Coins,
  History,
  LockOpen,
  Lock,
  Box,
  RefreshCw,
  X,
  CalendarDays
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const CHART_COLORS = [
  "#ef4444", "#16a34a", "#0284c7", "#f97316", "#8b5cf6", 
  "#0d9488", "#ec4899", "#eab308", "#6366f1", "#64748b"
];

export default function DashboardPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<string>("FINANCE_STAFF");
  const [userName, setUserName] = useState<string>("ຜູ້ໃຊ້ງານ");
  
  const [loading, setLoading] = useState(true);
  const currentYearNum = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYearNum);
  const [data, setData] = useState<any>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // 💡 1. ສ້າງ Dynamic List ຂອງ ປີ (ກວມເອົາ ປີປັດຈຸບັນ ແລະ ປີຍ້ອນຫຼັງ)
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYearNum - i);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard?year=${selectedYear}`);
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

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUserName(parsed.fullName || parsed.username || "ຜູ້ໃຊ້ງານ");
        setUserRole(parsed.role || "FINANCE_STAFF");
      } catch (e) {}
    }
    fetchDashboardData();
  }, [selectedYear]);

  const totalAssetValue = data?.assetCategories?.reduce((a: number, c: any) => a + c.value, 0) || 0;
  const totalAssetCount = data?.assetCategories?.reduce((a: number, c: any) => a + c.count, 0) || 0;

  const filteredTransactions = (data?.recentTransactions || []).filter((tx: any) =>
    (tx.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tx.refNo || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBudgets = (data?.budgets || []).filter((b: any) =>
    (b.projectName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (val: any) => `${Number(val || 0).toLocaleString()} ກີບ`;

  return (
    <div className="flex w-full min-h-screen bg-slate-50 font-sans">
      <Sidebar userRole={userRole} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Navbar 
          title="ພາບລວມລະບົບ (Dashboard)" 
          userName={userName} 
          userRole={userRole} 
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />

        <main className="p-6 space-y-6 w-full max-w-full overflow-hidden">
          
          {/* 1️⃣ ແຖບເຄື່ອງມື (Search & Dynamic Filter ປີ) */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ຄົ້ນຫາເອກະສານ, ເລກບິນ ຫຼື ໂຄງການ..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all font-medium text-slate-800"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
              <button 
                onClick={fetchDashboardData}
                className="p-2 text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all active:scale-95"
                title="ໂຫຼດຂໍ້ມູນໃໝ່"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>

              {/* Dynamic Year Select Dropdown */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700">
                <Calendar className="w-4 h-4 text-green-600" />
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="bg-transparent focus:outline-none font-bold cursor-pointer text-slate-800"
                >
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr}>ປີ {yr}</option>
                  ))}
                </select>
              </div>

              <div className="w-px h-8 bg-slate-200 mx-1 hidden sm:block"></div>
              
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl shadow-md shadow-green-600/20 transition-all whitespace-nowrap active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>ສ້າງລາຍການ</span>
              </button>
            </div>
          </div>

          {/* 2️⃣ ກ່ອງສະຫຼຸບ KPI 4 ຢ່າງ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-sm font-bold text-slate-500">ຍອດເງິນເຫຼືອປັດຈຸບັນ</h3>
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Wallet className="w-5 h-5" /></div>
              </div>
              <div className="relative z-10">
                <p className="text-2xl lg:text-3xl font-black text-slate-800">
                  {loading ? "..." : (data?.summary?.currentBalance || 0).toLocaleString()}
                </p>
                <p className="text-sm font-bold text-blue-600 mt-1">ກີບ (LAK)</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-sm font-bold text-slate-500">ລາຍຮັບບໍລິຫານ</h3>
                <div className="p-2 bg-green-100 text-green-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
              </div>
              <div className="relative z-10">
                <p className="text-xl lg:text-2xl font-black text-slate-800">
                  {loading ? "..." : (data?.summary?.totalAdminIncome || 0).toLocaleString()}
                </p>
                <p className="text-xs font-bold text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> ເງິນອຸປະຖຳ & ໃຊ້ໄດ້ເລີຍ
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-sm font-bold text-slate-500">ຄ່າທຳນຽມ & ບໍລິການ</h3>
                <div className="p-2 bg-teal-100 text-teal-600 rounded-lg"><Coins className="w-5 h-5" /></div>
              </div>
              <div className="relative z-10">
                <p className="text-xl lg:text-2xl font-black text-slate-800">
                  {loading ? "..." : (data?.summary?.totalFeeIncome || 0).toLocaleString()}
                </p>
                <p className="text-xs font-bold text-teal-600 mt-1">ມອບງົບລັດ & ວິຊາການ</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-sm font-bold text-slate-500">ລາຍຈ່າຍລວມ</h3>
                <div className="p-2 bg-red-100 text-red-600 rounded-lg"><TrendingDown className="w-5 h-5" /></div>
              </div>
              <div className="relative z-10">
                <p className="text-xl lg:text-2xl font-black text-slate-800">
                  {loading ? "..." : (data?.summary?.totalExpense || 0).toLocaleString()}
                </p>
                <p className="text-xs font-bold text-red-500 mt-1 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" /> ເບີກຈ່າຍຕົວຈິງແລ້ວ
                </p>
              </div>
            </div>
          </div>

          {/* 3️⃣ Area Chart ແນວໂນ້ມ & Card ສະຫຼຸບຍອດປະຈຳປີ (ປັບສີຂາວ Clean Look) */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-slate-800 text-base lg:text-lg">ແນວໂນ້ມ ລາຍຮັບ-ລາຍຈ່າຍ</h3>
                  <p className="text-xs text-slate-500 font-medium">ສະຫຼຸບການເຄື່ອນໄຫວປະຈຳເດືອນ ({selectedYear})</p>
                </div>
              </div>
              
              <div className="w-full h-[280px]">
                {loading ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">ກຳລັງໂຫຼດກຣາຟ...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data?.monthlyData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }} dy={5} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `${val / 1000000}M`} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={formatCurrency}
                      />
                      <Area type="monotone" dataKey="income" name="ລາຍຮັບ" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                      <Area type="monotone" dataKey="expense" name="ລາຍຈ່າຍ" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* 📅 ສະຫຼຸບຍອດປະຈຳປີ (ປັບເປັນສີຂາວ ສະອາດຕາ ເຂົ້າກັນກັບ Card ອື່ນໆ) */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm text-slate-800 flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-4 relative z-10 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">ສະຫຼຸບຍອດປະຈຳປີ {selectedYear}</h3>
                      <p className="text-[11px] text-slate-400 font-medium">ພາບລວມການເງິນປະຈຳປີ</p>
                    </div>
                  </div>

                  <div className={`px-2.5 py-1 text-[10px] font-bold rounded-full border flex items-center gap-1 shrink-0 ${
                    data?.summary?.isClosed 
                      ? "bg-red-50 text-red-600 border-red-200" 
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}>
                    {data?.summary?.isClosed ? <Lock className="w-3 h-3" /> : <LockOpen className="w-3 h-3" />}
                    {data?.summary?.isClosed ? "ປິດບັນຊີແລ້ວ" : "ກຳລັງດຳເນີນການ"}
                  </div>
                </div>

                <div className="space-y-3 relative z-10 mt-2">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                      <History className="w-4 h-4 text-blue-600" /> ຍອດເງິນຍົກມາຈາກປີ {selectedYear - 1}
                    </p>
                    <p className="text-xl font-black text-slate-800 ml-5">
                      {(data?.summary?.carryOverBalance || 0).toLocaleString()} <span className="text-xs font-medium text-slate-400">ກີບ</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-green-50/60 rounded-2xl border border-green-100">
                      <p className="text-green-700 font-bold">ລາຍຮັບປີນີ້</p>
                      <p className="font-black text-green-700 text-sm mt-0.5">
                        {((data?.summary?.totalAdminIncome || 0) + (data?.summary?.totalFeeIncome || 0)).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-red-50/60 rounded-2xl border border-red-100">
                      <p className="text-red-600 font-bold">ລາຍຈ່າຍປີນີ້</p>
                      <p className="font-black text-red-600 text-sm mt-0.5">
                        {(data?.summary?.totalExpense || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 relative z-10 mt-4">
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                  * ຍອດເງິນເຫຼືອສຸດທິຈະຖືກໂອນເປັນເງິນຍົກຍອດ ເມື່ອກົດ "ປິດບັນຊີປະຈຳປີ"
                </p>
              </div>
            </div>
          </div>

          {/* 4️⃣ 🍩 Pie Charts (ລາຍຮັບ - ລາຍຈ່າຍ - ຊັບສິນ) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 📥 1. ສັດສ່ວນລາຍຮັບ ຕາມໝວດໝູ່ */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" /> ລາຍຮັບແຕ່ລະສ່ວນ
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400">ຕາມໝວດໝູ່</span>
                </div>
                
                <div className="h-40 w-full my-2">
                  {(data?.incomeCategories || []).length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.incomeCategories}
                          cx="50%"
                          cy="50%"
                          innerRadius={38}
                          outerRadius={58}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {data.incomeCategories.map((_: any, index: number) => (
                            <Cell key={`inc-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="transparent" />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={formatCurrency} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">ຍັງບໍ່ມີຂໍ້ມູນລາຍຮັບ</div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 border-t border-slate-100 pt-3">
                {(data?.incomeCategories || []).map((cat: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-[11px] font-bold">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}></span>
                      <span className="text-slate-600 truncate">{cat.name}</span>
                    </div>
                    <span className="text-slate-800 shrink-0 ml-1">{cat.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 📤 2. ສັດສ່ວນລາຍຈ່າຍ ຕາມໝວດໝູ່ */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-500" /> ລາຍຈ່າຍແຕ່ລະສ່ວນ
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400">ຕາມໝວດໝູ່</span>
                </div>

                <div className="h-40 w-full my-2">
                  {(data?.expenseCategories || []).length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.expenseCategories}
                          cx="50%"
                          cy="50%"
                          innerRadius={38}
                          outerRadius={58}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {data.expenseCategories.map((_: any, index: number) => (
                            <Cell key={`exp-${index}`} fill={CHART_COLORS[(index + 3) % CHART_COLORS.length]} stroke="transparent" />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={formatCurrency} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">ຍັງບໍ່ມີຂໍ້ມູນລາຍຈ່າຍ</div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 border-t border-slate-100 pt-3">
                {(data?.expenseCategories || []).map((cat: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-[11px] font-bold">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[(i + 3) % CHART_COLORS.length] }}></span>
                      <span className="text-slate-600 truncate">{cat.name}</span>
                    </div>
                    <span className="text-slate-800 shrink-0 ml-1">{cat.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 📦 3. ສັດສ່ວນຊັບສິນ ຕາມໝວດໝູ່ & ມູນຄ່າ */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Box className="w-4 h-4 text-indigo-600" /> ຊັບສິນແຕ່ລະສ່ວນ
                  </h3>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {totalAssetCount} ລາຍການ
                  </span>
                </div>

                <div className="h-40 w-full my-2">
                  {(data?.assetCategories || []).length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.assetCategories}
                          cx="50%"
                          cy="50%"
                          innerRadius={38}
                          outerRadius={58}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {data.assetCategories.map((_: any, index: number) => (
                            <Cell key={`asset-${index}`} fill={CHART_COLORS[(index + 6) % CHART_COLORS.length]} stroke="transparent" />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={formatCurrency} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">ຍັງບໍ່ມີຂໍ້ມູນຊັບສິນ</div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 border-t border-slate-100 pt-3">
                <div className="flex justify-between text-[11px] font-black text-slate-800 pb-1 mb-1 border-b border-slate-100">
                  <span>ມູນຄ່າຊັບສິນລວມ:</span>
                  <span className="text-indigo-600">{totalAssetValue.toLocaleString()} ກີບ</span>
                </div>
                {(data?.assetCategories || []).map((cat: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-[11px] font-bold">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[(i + 6) % CHART_COLORS.length] }}></span>
                      <span className="text-slate-600 truncate">{cat.name} ({cat.count})</span>
                    </div>
                    <span className="text-slate-800 shrink-0 ml-1">{cat.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* 5️⃣ ຄວາມຄືບໜ້າງົບປະມານ & ເຄື່ອນໄຫວລ້າສຸດ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-amber-500" /> ຈໍານວນງົບປະມານໂຄງການ
                </h3>
              </div>
              <div className="space-y-4 mt-3">
                {filteredBudgets.length > 0 ? (
                  filteredBudgets.map((b: any) => {
                    const net = Number(b.netAmount || 0);
                    const used = Number(b.usedAmount || 0);
                    const percent = net > 0 ? Math.round((used / net) * 100) : 0;
                    const isWarning = percent >= 80;

                    return (
                      <div key={b.id}>
                        <div className="flex justify-between text-xs font-bold mb-1.5">
                          <span className="text-slate-700">{b.projectName}</span>
                          <span className={isWarning ? "text-red-500 font-extrabold" : "text-green-600"}>
                            ໃຊ້ແລ້ວ {percent}% ({used.toLocaleString()} / {net.toLocaleString()} ກີບ)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-2 rounded-full ${isWarning ? "bg-red-500" : "bg-green-500"}`} 
                            style={{ width: `${Math.min(percent, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center py-6 text-xs text-slate-400 font-medium">
                    {searchTerm ? "ບໍ່ພົບຂໍ້ມູນໂຄງການທີ່ຄົ້ນຫາ" : "ຍັງບໍ່ມີຂໍ້ມູນໂຄງສ້າງງົບປະມານ"}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" /> ການເຄື່ອນໄຫວລ້າສຸດ
                </h3>
              </div>
              <div className="space-y-2.5">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx: any) => (
                    <div key={tx.id} className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${tx.type === "income" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                          {tx.type === "income" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-800 line-clamp-1">{tx.title}</p>
                          <p className="text-[10px] text-slate-400">{tx.date} | {tx.refNo}</p>
                        </div>
                      </div>
                      <span className={`font-black text-xs ${tx.type === "income" ? "text-green-600" : "text-red-600"}`}>
                        {tx.type === "income" ? "+" : "-"}{tx.amount.toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-6 text-xs text-slate-400 font-medium">
                    {searchTerm ? "ບໍ່ພົບຂໍ້ມູນການເຄື່ອນໄຫວທີ່ຄົ້ນຫາ" : "ຍັງບໍ່ມີການເຄື່ອນໄຫວລ້າສຸດ"}
                  </p>
                )}
              </div>
            </div>
          </div>

        </main>
      </div>

      {/* Modal Quick Action */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">⚡ ເລືອກລາຍການທີ່ຕ້ອງການສ້າງ</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Link 
                href="/incomes" 
                onClick={() => setShowCreateModal(false)}
                className="p-3.5 bg-slate-50 hover:bg-green-50 border border-slate-200 hover:border-green-300 rounded-2xl flex items-center gap-3 group transition-all"
              >
                <div className="p-2.5 bg-green-100 text-green-600 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">📥 ບັນທຶກລາຍຮັບໃໝ່</p>
                  <p className="text-xs text-slate-400">ເພີ່ມລາຍຮັບບໍລິຫານ ຫຼື ຄ່າທຳນຽມ/ບໍລິການ</p>
                </div>
              </Link>

              <Link 
                href="/expenses" 
                onClick={() => setShowCreateModal(false)}
                className="p-3.5 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-300 rounded-2xl flex items-center gap-3 group transition-all"
              >
                <div className="p-2.5 bg-red-100 text-red-600 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">📤 ບັນທຶກລາຍຈ່າຍໃໝ່</p>
                  <p className="text-xs text-slate-400">ບັນທຶກການເບີກຈ່າຍຕົວຈິງປະຈຳວັນ</p>
                </div>
              </Link>

              <Link 
                href="/budgets" 
                onClick={() => setShowCreateModal(false)}
                className="p-3.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-2xl flex items-center gap-3 group transition-all"
              >
                <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">💼 ເພີ່ມໂຄງສ້າງງົບປະມານ</p>
                  <p className="text-xs text-slate-400">ສ້າງງົບປະມານໂຄງການໃໝ່</p>
                </div>
              </Link>

              <Link 
                href="/assets" 
                onClick={() => setShowCreateModal(false)}
                className="p-3.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-2xl flex items-center gap-3 group transition-all"
              >
                <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Box className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">📦 ບັນທຶກຊັບສິນໃໝ່</p>
                  <p className="text-xs text-slate-400">ເພີ່ມລາຍການຊັບສິນປະຈຳຫ້ອງການ</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}