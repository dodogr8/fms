"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { showSuccess, showError } from "@/lib/swal";
import { 
  FileText, 
  Printer, 
  FileSpreadsheet, 
  TrendingUp, 
  TrendingDown, 
  Briefcase, 
  Package,
  Calendar,
  RefreshCw,
  Search,
  PieChart,
  Wallet,
  Coins,
  Building2,
  CheckCircle2
} from "lucide-react";
import * as XLSX from "xlsx";
import { useReactToPrint } from "react-to-print";

export default function ReportsPage() {
  const [userRole, setUserRole] = useState<"ADMIN" | "DIRECTOR" | "FINANCE_STAFF" | "ASSET_STAFF">("FINANCE_STAFF");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [reportType, setReportType] = useState<"summary" | "incomes" | "expenses" | "budgets" | "assets">("summary");

  // State ສຳລັບ Filter ວັນທີ & ຄຳຄົ້ນຫາ
  const [startDate, setStartDate] = useState(`${new Date().getFullYear()}-01-01`);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // States ເກັບຂໍ້ມູນຕົວຈິງຈາກ API
  const [incomesData, setIncomesData] = useState<any[]>([]);
  const [expensesData, setExpensesData] = useState<any[]>([]);
  const [budgetsData, setBudgetsData] = useState<any[]>([]);
  const [assetsData, setAssetsData] = useState<any[]>([]);

  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.role) setUserRole(parsed.role);
      } catch (e) {}
    }
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [incRes, expRes, budRes, astRes] = await Promise.all([
        fetch("/api/incomes"),
        fetch("/api/expenses"),
        fetch("/api/budgets"),
        fetch("/api/assets"),
      ]);

      if (incRes.ok) setIncomesData(await incRes.json());
      if (expRes.ok) setExpensesData(await expRes.json());
      if (budRes.ok) setBudgetsData(await budRes.json());
      if (astRes.ok) setAssetsData(await astRes.json());
    } catch (err) {
      console.error("Fetch Reports Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 💡 1. ຄິດໄລ່ຂໍ້ມູນກັ່ນກອງຕາມວັນທີ ສຳລັບແຕ່ລະປະເພດ
  const filteredIncomes = useMemo(() => {
    return incomesData.filter((item) => {
      const itemDate = item.date || "";
      const matchDate = (!startDate || itemDate >= startDate) && (!endDate || itemDate <= endDate);
      const matchSearch =
        (item.referenceNo && item.referenceNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.categoryName && item.categoryName.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchDate && matchSearch;
    });
  }, [incomesData, startDate, endDate, searchTerm]);

  const filteredExpenses = useMemo(() => {
    return expensesData.filter((item) => {
      const itemDate = item.date || "";
      const matchDate = (!startDate || itemDate >= startDate) && (!endDate || itemDate <= endDate);
      const matchSearch =
        (item.referenceNo && item.referenceNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.categoryName && item.categoryName.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchDate && matchSearch;
    });
  }, [expensesData, startDate, endDate, searchTerm]);

  const filteredBudgets = useMemo(() => {
    return budgetsData.filter((item) => {
      const itemDate = item.startDate || "";
      const matchDate = (!startDate || itemDate >= startDate) && (!endDate || itemDate <= endDate);
      const matchSearch =
        (item.projectName && item.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.categoryName && item.categoryName.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchDate && matchSearch;
    });
  }, [budgetsData, startDate, endDate, searchTerm]);

  const filteredAssets = useMemo(() => {
    return assetsData.filter((item) => {
      const matchSearch =
        (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.user && item.user.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchSearch;
    });
  }, [assetsData, searchTerm]);

  // 💡 2. ສູດຄິດໄລ່ຍອດສູບລວມ
  const summaryMetrics = useMemo(() => {
    let regularIncome = 0;
    let feeIncome = 0;
    let serviceIncome = 0;

    filteredIncomes.forEach((item) => {
      if (item.incomeType === "FEE_SERVICE") {
        feeIncome += Number(item.feeAmount || 0);
        serviceIncome += Number(item.serviceAmount || 0);
      } else {
        regularIncome += Number(item.amount || 0);
      }
    });

    const totalExpense = filteredExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const netBalance = regularIncome - totalExpense;

    const totalBudget = filteredBudgets.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
    const budgetUsed = filteredBudgets.reduce((sum, item) => sum + Number(item.usedAmount || 0), 0);

    const totalAssetValue = filteredAssets.reduce((sum, item) => sum + Number(item.price || item.cost || 0), 0);

    return {
      regularIncome,
      feeIncome,
      serviceIncome,
      totalIncome: regularIncome + feeIncome + serviceIncome,
      totalExpense,
      netBalance,
      totalBudget,
      budgetUsed,
      totalAssetValue,
    };
  }, [filteredIncomes, filteredExpenses, filteredBudgets, filteredAssets]);

  // 💡 3. ຟັງຊັນສັ່ງພິມ (Print / PDF)
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `ລາຍງານ_${reportType}_${new Date().toISOString().split("T")[0]}`,
  });

  // 💡 4. ຟັງຊັນ Export ເປັນ Excel
  const handleExportExcel = () => {
    let excelData: any[] = [];

    if (reportType === "summary") {
      excelData = [
        { "ລາຍການສະຫຼຸບ": "1. ລາຍຮັບບໍລິຫານ/ປົກກະຕິ (ໃຊ້ໄດ້ເລີຍ)", "ຈຳນວນເງິນ (ກີບ)": summaryMetrics.regularIncome },
        { "ລາຍການສະຫຼຸບ": "2. ຄ່າທຳນຽມ (ມອບງົບປະມານລັດ)", "ຈຳນວນເງິນ (ກີບ)": summaryMetrics.feeIncome },
        { "ລາຍການສະຫຼຸບ": "3. ຄ່າບໍລິການ (ວິຊາການ)", "ຈຳນວນເງິນ (ກີບ)": summaryMetrics.serviceIncome },
        { "ລາຍການສະຫຼຸບ": "ຍອດລວມຈັດເກັບລາຍຮັບໄດ້ທັງໝົດ", "ຈຳນວນເງິນ (ກີບ)": summaryMetrics.totalIncome },
        { "ລາຍການສະຫຼຸບ": "4. ລາຍຈ່າຍລວມຕົວຈິງ", "ຈຳນວນເງິນ (ກີບ)": summaryMetrics.totalExpense },
        { "ລາຍການສະຫຼຸບ": "ຍອດເງິນເຫຼືອສຸດທິບໍລິຫານ (Net Balance)", "ຈຳນວນເງິນ (ກີບ)": summaryMetrics.netBalance },
        { "ລາຍການສະຫຼຸບ": "5. ງົບປະມານໂຄງການລວມ", "ຈຳນວນເງິນ (ກີບ)": summaryMetrics.totalBudget },
        { "ລາຍການສະຫຼຸບ": "6. ມູນຄ່າຊັບສິນລວມ", "ຈຳນວນເງິນ (ກີບ)": summaryMetrics.totalAssetValue },
      ];
    } else if (reportType === "incomes") {
      excelData = filteredIncomes.map((item, index) => ({
        "ລຳດັບ": index + 1,
        "ເລກບິນ/ອ້າງອີງ": item.referenceNo || "-",
        "ວັນທີ": item.date || "-",
        "ປະເພດ": item.incomeType === "FEE_SERVICE" ? "ຄ່າທຳນຽມ&ບໍລິການ" : "ບໍລິຫານ",
        "ໝວດໝູ່": item.categoryName || item.category || "-",
        "ເນື້ອໃນ": item.description || "-",
        "ຄ່າທຳນຽມ": item.feeAmount || 0,
        "ຄ່າບໍລິການ": item.serviceAmount || 0,
        "ຍອດລວມບິນ": item.amount || 0,
      }));
    } else if (reportType === "expenses") {
      excelData = filteredExpenses.map((item, index) => ({
        "ລຳດັບ": index + 1,
        "ເລກບິນ/ອ້າງອີງ": item.referenceNo || "-",
        "ວັນທີ": item.date || "-",
        "ໝວດໝູ່": item.categoryName || item.category || "-",
        "ເນື້ອໃນ": item.description || "-",
        "ຜູ້ຮັບເງິນ": item.payee || item.disburser || "-",
        "ຈຳນວນເງິນ": item.amount || 0,
      }));
    } else if (reportType === "budgets") {
      excelData = filteredBudgets.map((item, index) => ({
        "ລຳດັບ": index + 1,
        "ຊື່ໂຄງການ": item.projectName || "-",
        "ໝວດໝູ່": item.categoryName || "-",
        "ງົບປະມານລວມ": item.totalAmount || 0,
        "ເງິນບໍລິຫານ (ຫັກ)": item.deductAmount || 0,
        "ງົບປະມານສຸດທິ": item.netAmount || 0,
        "ໃຊ້ຈ່າຍແລ້ວ": item.usedAmount || 0,
      }));
    } else if (reportType === "assets") {
      excelData = filteredAssets.map((item, index) => ({
        "ລຳດັບ": index + 1,
        "ລະຫັດຊັບສິນ": item.code || "-",
        "ຊື່ຊັບສິນ": item.name || "-",
        "ໝວດໝູ່": item.category || "-",
        "ມູນຄ່າ (ກີບ)": item.price || item.cost || 0,
        "ຜູ້ຮັບຜິດຊອບ": item.user || "-",
        "ສະຖານະ": item.status || "-",
      }));
    }

    if (excelData.length === 0) {
      showError("ບໍ່ມີຂໍ້ມູນ!", "ບໍ່ມີຂໍ້ມູນໃນຕາຕະລາງເພື່ອ Export");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `ລາຍງານ_${reportType}_${new Date().toISOString().split("T")[0]}.xlsx`);
    showSuccess("Export ສຳເລັດ!", "ດຶງຂໍ້ມູນອອກເປັນ Excel เรียบร้อยແລ້ວ");
  };

  const getReportTitle = () => {
    switch (reportType) {
      case "summary": return "ບົດລາຍງານລວມ";
      case "incomes": return "ບົດລາຍງານລາຍຮັບ";
      case "expenses": return "ບົດລາຍງານລາຍຈ່າຍ";
      case "budgets": return "ບົດລາຍງານງົບປະມານໂຄງການ";
      case "assets": return "ບົດລາຍງານຊັບສິນ";
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-slate-50 overflow-x-hidden">
      <Sidebar userRole={userRole} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Navbar 
          title="ສະຫຼຸບ ແລະ ລາຍງານ (Reports)" 
          userName="ຜູ້ໃຊ້ງານລະບົບ" 
          userRole={userRole} 
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />

        <main className="p-6 space-y-6 w-full max-w-full overflow-hidden">
          {/* Header Bar */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                <PieChart className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">{getReportTitle()}</h2>
                <p className="text-xs text-slate-500 font-medium">ລາຍງານ ແລະ ສະຫຼຸບພາບລວມທັງໝົດຂອງການເງິນ ແລະ ຊັບສິນ</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 w-full lg:w-auto">
              <button
                onClick={fetchAllData}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-2 transition-all"
                title="ໂຫຼດຂໍ້ມູນໃໝ່"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                <span>ໂຫຼດໃໝ່</span>
              </button>

              <button
                onClick={handleExportExcel}
                className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200/80 text-xs font-bold rounded-xl transition-all"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Excel</span>
              </button>

              <button
                onClick={() => handlePrint()}
                className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>ສັ່ງພິມ / ບັນທຶກ PDF</span>
              </button>
            </div>
          </div>

          {/* 💡 Report Tabs Navigation */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 border-b border-slate-100 pb-4">
              <button
                onClick={() => setReportType("summary")}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all ${
                  reportType === "summary"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <PieChart className="w-4 h-4" />
                <span>📊 ສະຫຼຸບພາບລວມ</span>
              </button>

              <button
                onClick={() => setReportType("incomes")}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all ${
                  reportType === "incomes"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>ລາຍຮັບ</span>
              </button>

              <button
                onClick={() => setReportType("expenses")}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all ${
                  reportType === "expenses"
                    ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                <span>ລາຍຈ່າຍ</span>
              </button>

              <button
                onClick={() => setReportType("budgets")}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all ${
                  reportType === "budgets"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>ງົບປະມານໂຄງການ</span>
              </button>

              <button
                onClick={() => setReportType("assets")}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all ${
                  reportType === "assets"
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Package className="w-4 h-4" />
                <span>ລາຍງານຊັບສິນ</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-1">
              <div className="flex flex-1 flex-wrap items-center gap-3 w-full">
                {reportType !== "assets" && (
                  <div className="flex items-center gap-2 bg-slate-50 p-2 border rounded-xl text-xs font-semibold text-slate-700">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>ແຕ່ວັນທີ:</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="p-1 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <span>ຫາ:</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="p-1 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                )}

                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ຄົ້ນຫາລາຍການ/ເອກະສານ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 💡 ພື້ນທີ່ສະແດງເອກະສານ ສຳລັບພິມ (Print / PDF Document Sheet) */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto">
            <div ref={componentRef} className="p-8 bg-white min-w-[750px] space-y-6 text-slate-800" style={{ fontFamily: "'Phetsarath', 'Phetsarath OT', sans-serif" }}>
              
              {/* Header ເອກະສານທາງການ */}
              <div className="text-center space-y-1">
                <p className="font-bold">ສາທາລະນະລັດ ປະຊາທິປະໄຕ ປະຊາຊົນລາວ</p>
                <p className="font-bold">ສັນຕິພາບ ເອກະລາດ ປະຊາທິປະໄຕ ເອກະພາບ ວັດທະນະຖາວອນ</p>
                <div className="h-4" />
                <h2 className="text-lg font-black uppercase text-slate-900">{getReportTitle()}</h2>
                {reportType !== "assets" && (
                  <p className="text-xs font-semibold text-slate-500">
                    ປະຈຳຊ່ວງວັນທີ: {startDate} ຫາ {endDate}
                  </p>
                )}
              </div>

              {/* ------------------------------------------------------------- */}
              {/* 📊 TAB 1: ສະຫຼຸບຍອດພາບລວມ (SUMMARY REPORT VIEW) */}
              {/* ------------------------------------------------------------- */}
              {reportType === "summary" && (
                <div className="space-y-6">
                  {/* Summary Cards ໃນເອກະສານ */}
                  <div className="grid grid-cols-3 gap-4 text-xs font-bold">
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                      <p className="text-emerald-800 uppercase text-[14px]">1. ລາຍຮັບບໍລິຫານ</p>
                      <p className="text-xl font-black text-emerald-700 mt-1">{summaryMetrics.regularIncome.toLocaleString()} ກີບ</p>
                    </div>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                      <p className="text-red-800 uppercase text-[12px]">2. ລາຍຈ່າຍລວມຕົວຈິງ</p>
                      <p className="text-xl font-black text-red-700 mt-1">{summaryMetrics.totalExpense.toLocaleString()} ກີບ</p>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                      <p className="text-blue-800 uppercase text-[12px]">3. ຍອດເງິນເຫຼືອສຸດທິ</p>
                      <p className={`text-xl font-black mt-1 ${summaryMetrics.netBalance >= 0 ? "text-blue-700" : "text-red-700"}`}>
                        {summaryMetrics.netBalance.toLocaleString()} ກີບ
                      </p>
                    </div>
                  </div>

                  {/* Summary Table 1: ພາບລວມລາຍຮັບ & ລາຍຈ່າຍ */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-sm text-slate-800">I. ສະຫຼຸບຍອດລາຍຮັບ - ລາຍຈ່າຍ</h3>
                    <table className="w-full text-left text-xs border-collapse border border-slate-300">
                      <thead>
                        <tr className="bg-slate-100 text-slate-900 font-bold text-center">
                          <th className="p-2.5 border border-slate-300 w-12">ລ/ດ</th>
                          <th className="p-2.5 border border-slate-300">ລາຍການ</th>
                          <th className="p-2.5 border border-slate-300">ສະຖານະ</th>
                          <th className="p-2.5 border border-slate-300 text-right">ຈຳນວນເງິນ (ກີບ)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-medium">
                        <tr>
                          <td className="p-2.5 border border-slate-300 text-center font-bold">1</td>
                          <td className="p-2.5 border border-slate-300 font-bold text-slate-800">ລາຍຮັບບໍລິຫານ</td>
                          <td className="p-2.5 border border-slate-300 text-emerald-700 font-bold">🟢 ໃຊ້ຈ່າຍໄດ້ເລີຍ</td>
                          <td className="p-2.5 border border-slate-300 text-right font-black text-emerald-700">{summaryMetrics.regularIncome.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 border border-slate-300 text-center font-bold">2</td>
                          <td className="p-2.5 border border-slate-300 font-bold text-slate-800">ຄ່າທຳນຽມ</td>
                          <td className="p-2.5 border border-slate-300 text-blue-700 font-bold">🏛️ ມອບເຂົ້າງົບປະມານລັດ</td>
                          <td className="p-2.5 border border-slate-300 text-right font-black text-blue-700">{summaryMetrics.feeIncome.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 border border-slate-300 text-center font-bold">3</td>
                          <td className="p-2.5 border border-slate-300 font-bold text-slate-800">ຄ່າບໍລິການ</td>
                          <td className="p-2.5 border border-slate-300 text-purple-700 font-bold">💼 ລາຍຮັບວິຊາການ</td>
                          <td className="p-2.5 border border-slate-300 text-right font-black text-purple-700">{summaryMetrics.serviceIncome.toLocaleString()}</td>
                        </tr>
                        <tr className="bg-slate-50 font-bold">
                          <td colSpan={3} className="p-2.5 border border-slate-300 text-right uppercase">ຍອດລວມຈັດເກັບລາຍຮັບໄດ້ທັງໝົດ:</td>
                          <td className="p-2.5 border border-slate-300 text-right font-black text-slate-900">{summaryMetrics.totalIncome.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 border border-slate-300 text-center font-bold">4</td>
                          <td className="p-2.5 border border-slate-300 font-bold text-slate-800">ລາຍຈ່າຍບໍລິຫານ ແລະ ການດຳເນີນງານຕົວຈິງ</td>
                          <td className="p-2.5 border border-slate-300 text-red-700 font-bold">🔴 ເບີກຈ່າຍແລ້ວ</td>
                          <td className="p-2.5 border border-slate-300 text-right font-black text-red-600">{summaryMetrics.totalExpense.toLocaleString()}</td>
                        </tr>
                        <tr className="bg-blue-50 font-black">
                          <td colSpan={3} className="p-2.5 border border-slate-300 text-right uppercase text-blue-900">ຍອດເງິນເຫຼືອສຸດທິບໍລິຫານ (Net Balance):</td>
                          <td className={`p-2.5 border border-slate-300 text-right font-black text-base ${summaryMetrics.netBalance >= 0 ? "text-blue-700" : "text-red-700"}`}>
                            {summaryMetrics.netBalance.toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Table 2: ງົບປະມານ & ຊັບສິນ */}
                  <div className="space-y-2 pt-2">
                    <h3 className="font-bold text-sm text-slate-800">II. ງົບປະມານໂຄງການ ແລະ ຊັບສິນ</h3>
                    <table className="w-full text-left text-xs border-collapse border border-slate-300">
                      <thead>
                        <tr className="bg-slate-100 text-slate-900 font-bold text-center">
                          <th className="p-2.5 border border-slate-300 w-12">ລ/ດ</th>
                          <th className="p-2.5 border border-slate-300">ເນື້ອໃນ</th>
                          <th className="p-2.5 border border-slate-300 text-center">ຈຳນວນ</th>
                          <th className="p-2.5 border border-slate-300 text-right">ມູນຄ່າ/ຍອດລວມ (ກີບ)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-medium">
                        <tr>
                          <td className="p-2.5 border border-slate-300 text-center font-bold">1</td>
                          <td className="p-2.5 border border-slate-300 font-bold text-slate-800">ງົບປະມານໂຄງການທັງໝົດ (Total Budgets)</td>
                          <td className="p-2.5 border border-slate-300 text-center">{filteredBudgets.length} ໂຄງການ</td>
                          <td className="p-2.5 border border-slate-300 text-right font-black text-slate-900">{summaryMetrics.totalBudget.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 border border-slate-300 text-center font-bold">2</td>
                          <td className="p-2.5 border border-slate-300 font-bold text-slate-800">ງົບປະມານທີ່ເບີກຈ່າຍແລ້ວ (Budget Used)</td>
                          <td className="p-2.5 border border-slate-300 text-center">-</td>
                          <td className="p-2.5 border border-slate-300 text-right font-black text-red-600">{summaryMetrics.budgetUsed.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 border border-slate-300 text-center font-bold">3</td>
                          <td className="p-2.5 border border-slate-300 font-bold text-slate-800">ມູນຄ່າຊັບສິນລວມຂອງຫ້ອງການ (Total Assets Value)</td>
                          <td className="p-2.5 border border-slate-300 text-center">{filteredAssets.length} ຢ່າງ</td>
                          <td className="p-2.5 border border-slate-300 text-right font-black text-purple-700">{summaryMetrics.totalAssetValue.toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* 🟢 TAB 2: ລາຍງານລາຍຮັບ (INCOMES VIEW) */}
              {/* ------------------------------------------------------------- */}
              {reportType === "incomes" && (
                <table className="w-full text-left text-xs border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-900 text-center">
                      <th className="p-2.5 border border-slate-300 w-12">ລ/ດ</th>
                      <th className="p-2.5 border border-slate-300">ເລກທີ</th>
                      <th className="p-2.5 border border-slate-300">ໝວດໝູ່</th>
                      <th className="p-2.5 border border-slate-300">ເນື້ອໃນລາຍການ</th>
                      <th className="p-2.5 border border-slate-300 text-right">ຄ່າທຳນຽມ</th>
                      <th className="p-2.5 border border-slate-300 text-right">ຄ່າບໍລິການ</th>
                      <th className="p-2.5 border border-slate-300 text-right">ຈຳນວນເງິນລວມ (ກີບ)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {filteredIncomes.length > 0 ? (
                      filteredIncomes.map((item, index) => (
                        <tr key={item.id || index} className="hover:bg-slate-50">
                          <td className="p-2.5 border border-slate-300 text-center font-bold text-slate-500">{index + 1}</td>
                          <td className="p-2.5 border border-slate-300 whitespace-nowrap">
                            <p className="font-bold">{item.referenceNo || "-"}</p>
                            <p className="text-[10px] text-slate-400">{item.date}</p>
                          </td>
                          <td className="p-2.5 border border-slate-300 font-bold text-emerald-800">
                            {item.categoryName || item.category || "-"}
                          </td>
                          <td className="p-2.5 border border-slate-300">{item.description}</td>
                          <td className="p-2.5 border border-slate-300 text-right font-bold text-blue-600">
                            {Number(item.feeAmount || 0).toLocaleString()}
                          </td>
                          <td className="p-2.5 border border-slate-300 text-right font-bold text-purple-600">
                            {Number(item.serviceAmount || 0).toLocaleString()}
                          </td>
                          <td className="p-2.5 border border-slate-300 text-right font-black text-slate-900">
                            {Number(item.amount || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={7} className="p-8 text-center text-slate-400">ບໍ່ພົບຂໍ້ມູນລາຍຮັບ</td></tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* ------------------------------------------------------------- */}
              {/* 🔴 TAB 3: ລາຍງານລາຍຈ່າຍ (EXPENSES VIEW) */}
              {/* ------------------------------------------------------------- */}
              {reportType === "expenses" && (
                <table className="w-full text-left text-xs border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-900 text-center">
                      <th className="p-2.5 border border-slate-300 w-12">ລ/ດ</th>
                      <th className="p-2.5 border border-slate-300">ເລກບິນ</th>
                      <th className="p-2.5 border border-slate-300">ໝວດໝູ່</th>
                      <th className="p-2.5 border border-slate-300">ເນື້ອໃນ</th>
                      <th className="p-2.5 border border-slate-300">ຜູ້ຮັບເງິນ</th>
                      <th className="p-2.5 border border-slate-300 text-right">ຈຳນວນເງິນ (ກີບ)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {filteredExpenses.length > 0 ? (
                      filteredExpenses.map((item, index) => (
                        <tr key={item.id || index} className="hover:bg-slate-50">
                          <td className="p-2.5 border border-slate-300 text-center font-bold text-slate-500">{index + 1}</td>
                          <td className="p-2.5 border border-slate-300 whitespace-nowrap">
                            <p className="font-bold">{item.referenceNo || "-"}</p>
                            <p className="text-[10px] text-slate-400">{item.date}</p>
                          </td>
                          <td className="p-2.5 border border-slate-300 font-bold text-red-800">
                            {item.categoryName || item.category || "-"}
                          </td>
                          <td className="p-2.5 border border-slate-300">{item.description}</td>
                          <td className="p-2.5 border border-slate-300">{item.payee || item.disburser || "-"}</td>
                          <td className="p-2.5 border border-slate-300 text-right font-black text-red-600">
                            {Number(item.amount || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={6} className="p-8 text-center text-slate-400">ບໍ່ພົບຂໍ້ມູນລາຍຈ່າຍ</td></tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* ------------------------------------------------------------- */}
              {/* 💼 TAB 4: ລາຍງານງົບປະມານ (BUDGETS VIEW) */}
              {/* ------------------------------------------------------------- */}
              {reportType === "budgets" && (
                <table className="w-full text-left text-xs border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-900 text-center">
                      <th className="p-2.5 border border-slate-300 w-12">ລ/ດ</th>
                      <th className="p-2.5 border border-slate-300">ຊື່ໂຄງການ</th>
                      <th className="p-2.5 border border-slate-300">ໝວດໝູ່</th>
                      <th className="p-2.5 border border-slate-300 text-right">ງົບປະມານລວມ</th>
                      <th className="p-2.5 border border-slate-300 text-right">ຫັກເຂົ້າບໍລິຫານ</th>
                      <th className="p-2.5 border border-slate-300 text-right">ງົບປະມານສຸດທິ</th>
                      <th className="p-2.5 border border-slate-300 text-right">ໃຊ້ຈ່າຍແລ້ວ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {filteredBudgets.length > 0 ? (
                      filteredBudgets.map((item, index) => (
                        <tr key={item.id || index} className="hover:bg-slate-50">
                          <td className="p-2.5 border border-slate-300 text-center font-bold text-slate-500">{index + 1}</td>
                          <td className="p-2.5 border border-slate-300 font-bold text-slate-800">{item.projectName}</td>
                          <td className="p-2.5 border border-slate-300">{item.categoryName || "-"}</td>
                          <td className="p-2.5 border border-slate-300 text-right font-bold">
                            {Number(item.totalAmount || 0).toLocaleString()}
                          </td>
                          <td className="p-2.5 border border-slate-300 text-right font-bold text-emerald-600">
                            {Number(item.deductAmount || 0).toLocaleString()}
                          </td>
                          <td className="p-2.5 border border-slate-300 text-right font-bold text-blue-600">
                            {Number(item.netAmount || 0).toLocaleString()}
                          </td>
                          <td className="p-2.5 border border-slate-300 text-right font-bold text-red-600">
                            {Number(item.usedAmount || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={7} className="p-8 text-center text-slate-400">ບໍ່ພົບຂໍ້ມູນງົບປະມານ</td></tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* ------------------------------------------------------------- */}
              {/* 📦 TAB 5: ລາຍງານຊັບສິນ (ASSETS VIEW) */}
              {/* ------------------------------------------------------------- */}
              {reportType === "assets" && (
                <table className="w-full text-left text-xs border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-900 text-center">
                      <th className="p-2.5 border border-slate-300 w-12">ລ/ດ</th>
                      <th className="p-2.5 border border-slate-300">ລະຫັດຊັບສິນ</th>
                      <th className="p-2.5 border border-slate-300">ຊື່ຊັບສິນ</th>
                      <th className="p-2.5 border border-slate-300">ໝວດໝູ່</th>
                      <th className="p-2.5 border border-slate-300 text-right">ມູນຄ່າ (ກີບ)</th>
                      <th className="p-2.5 border border-slate-300">ຜູ້ຮັບຜິດຊອບ</th>
                      <th className="p-2.5 border border-slate-300 text-center">ສະຖານະ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {filteredAssets.length > 0 ? (
                      filteredAssets.map((item, index) => (
                        <tr key={item.id || index} className="hover:bg-slate-50">
                          <td className="p-2.5 border border-slate-300 text-center font-bold text-slate-500">{index + 1}</td>
                          <td className="p-2.5 border border-slate-300 font-bold text-purple-700">{item.code || "-"}</td>
                          <td className="p-2.5 border border-slate-300 font-bold">{item.name}</td>
                          <td className="p-2.5 border border-slate-300">{item.category || "-"}</td>
                          <td className="p-2.5 border border-slate-300 text-right font-bold">
                            {Number(item.price || item.cost || 0).toLocaleString()}
                          </td>
                          <td className="p-2.5 border border-slate-300">{item.user || "-"}</td>
                          <td className="p-2.5 border border-slate-300 text-center font-bold">{item.status || "ປົກກະຕິ"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={7} className="p-8 text-center text-slate-400">ບໍ່ພົບຂໍ້ມູນຊັບສິນ</td></tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* Footer ສຳລັບລາຍເຊັນທາງການ */}
              <div className="pt-12 grid grid-cols-2 text-center text-xs font-bold gap-8">
                <div>
                  <p>ຜູ້ລາຍງານ</p>
                  <div className="h-20" />
                </div>

                <div>
                  <p>ຫົວໜ້າກົມ</p>
                  <div className="h-20" />
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}