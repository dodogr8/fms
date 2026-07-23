"use client";

import { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { 
  FileText, 
  Printer, 
  FileSpreadsheet, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Package,
  Calendar
} from "lucide-react";
import * as XLSX from "xlsx";
import { useReactToPrint } from "react-to-print";

export default function ReportsPage() {
  // 💡 State ເກັບ Role ຂອງ User
  const [userRole, setUserRole] = useState<"ADMIN" | "DIRECTOR" | "FINANCE_STAFF" | "ASSET_STAFF">("FINANCE_STAFF");
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [reportType, setReportType] = useState<"incomes" | "expenses" | "budgets" | "assets">("incomes");
  
  // State ສຳລັບ Filter ວັນທີ
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  // 💡 ດຶງ Role ຈາກ LocalStorage ຕອນເປີດໜ້າຈໍ
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.role) {
          setUserRole(parsed.role);
          // 🔒 ຖ້າເປັນ ASSET_STAFF ໃຫ້ລັອກປະເພດລາຍງານເປັນ "assets" ທັນທີ
          if (parsed.role === "ASSET_STAFF") {
            setReportType("assets");
          }
        }
      } catch (e) {
        console.error("Error parsing user role", e);
      }
    }
  }, []);

  // Ref ສຳລັບການ ພິມ / Save PDF
  const printRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Financial_Report_${reportType}_${new Date().toISOString().split("T")[0]}`,
  });

  // Dummy Data ຕົວຢ່າງ (ສາມາດດຶງຈາກ DB ໄດ້)
  const incomeReports = [
    { id: 1, date: "2026-07-01", code: "INC-001", title: "ເງິນອຸດໜູນຈາກກະຊວງ", category: "ງົບປະມານລັດ", amount: 150000000, payer: "ກະຊວງການເງິນ", remark: "ໂອນເຂົ້າບັນຊີ" },
    { id: 2, date: "2026-07-05", code: "INC-002", title: "ຄ່າທຳນຽມບໍລິການ", category: "ວິຊາການ", amount: 25000000, payer: "ບໍລິສັດ ABC", remark: "ເງິນສົດ" },
  ];

  const expenseReports = [
    { id: 1, date: "2026-07-02", code: "EXP-001", title: "ຊື້ເຈ້ຍ A4 ແລະ ອຸປະກອນຫ້ອງການ", category: "ບໍລິຫານ", amount: 2500000, payee: "ຮ້ານ ສົມໃຈ", remark: "ຈ່າຍເງິນສົດ" },
    { id: 2, date: "2026-07-10", code: "EXP-002", title: "ຄ່າໄຟຟ້າ ປະຈຳເດືອນ 6", category: "ສາທາລະນຸໂພກ", amount: 4800000, payee: "ລັດວິສາຫະກິດໄຟຟ້າລາວ", remark: "ໂອນຈ່າຍ" },
  ];

  const budgetReports = [
    { id: 1, name: "ໂຄງການພັດທະນາລະບົບ IT", total: 100000000, used: 45000000, remain: 55000000, percent: 45 },
    { id: 2, name: "ງົບປະມານບໍລິຫານຫ້ອງການ 2026", total: 200000000, used: 120000000, remain: 80000000, percent: 60 },
  ];

  const assetReports = [
    { id: 1, code: "AST-001", name: "ຄອມພິວເຕີ ຕັ້ງໂຕະ Dell", category: "ອຸປະກອນ IT", price: 12000000, user: "ທ່ານ ສົມຊາຍ", status: "ກຳລັງນຳໃຊ້" },
    { id: 2, code: "AST-002", name: "ປຣິນເຕີ Canon Laser", category: "ອຸປະກອນ IT", price: 4500000, user: "ຫ້ອງການບໍລິຫານ", status: "ກຳລັງນຳໃຊ້" },
  ];

  // Export Excel
  const handleExportExcel = () => {
    let exportData: any[] = [];
    if (reportType === "incomes") exportData = incomeReports;
    else if (reportType === "expenses") exportData = expenseReports;
    else if (reportType === "budgets") exportData = budgetReports;
    else exportData = assetReports;

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `Report_${reportType}_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <div className="flex w-full min-h-screen bg-slate-50 overflow-x-hidden">
      <Sidebar userRole={userRole} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Navbar 
          title="ການລາຍງານ (Reports)" 
          userName="ຜູ້ໃຊ້ງານລະບົບ" 
          userRole={userRole} 
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />

        <main className="p-6 space-y-6 w-full max-w-full overflow-hidden">
          
          {/* Header Card Controls */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-50 text-green-600 rounded-2xl border border-green-100">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">ບົດລາຍງານ ແລະ ພິມເອກະສານລາຍງານ</h2>
                  <p className="text-xs text-slate-500">ເລືອກປະເພດລາຍງານ ແລະ ກັ່ນຕອງຊ່ວງວັນທີ ທີ່ຕ້ອງການ</p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleExportExcel}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Export Excel</span>
                </button>

                <button
                  onClick={() => handlePrint()}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-green-600/20 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>ພິມ / Save PDF</span>
                </button>
              </div>
            </div>

            {/* 💡 ປຸ່ມເລືອກປະເພດບົດລາຍງານ (ເຊື່ອງປະເພດອື່ນ ຖ້າເປັນ ASSET_STAFF) */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              {userRole !== "ASSET_STAFF" && (
                <>
                  <button
                    onClick={() => setReportType("incomes")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      reportType === "incomes"
                        ? "bg-green-600 text-white shadow-md shadow-green-600/20"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>ລາຍງານລາຍຮັບ</span>
                  </button>

                  <button
                    onClick={() => setReportType("expenses")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      reportType === "expenses"
                        ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <TrendingDown className="w-4 h-4" />
                    <span>ລາຍງານລາຍຈ່າຍ</span>
                  </button>

                  <button
                    onClick={() => setReportType("budgets")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      reportType === "budgets"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <PieChart className="w-4 h-4" />
                    <span>ລາຍງານງົບປະມານ</span>
                  </button>
                </>
              )}

              <button
                onClick={() => setReportType("assets")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  reportType === "assets"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Package className="w-4 h-4" />
                <span>ລາຍງານຊັບສິນ</span>
              </button>
            </div>

            {/* Date Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">ຕັ້ງແຕ່ວັນທີ</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">ເຖິງວັນທີ</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
            </div>
          </div>

          {/* 📄 ພື້ນທີ່ສະແດງເອກະສານ ສຳລັບພິມ ( Official Print View ) */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
            <div ref={printRef} className="p-8 bg-white space-y-6 text-slate-900">
              
              {/* Header ທາງການ */}
              <div className="text-center space-y-1">
                <p className="font-bold">ສາທາລະນະລັດ ປະຊາທິປະໄຕ ປະຊາຊົນລາວ</p>
                <p className="font-bold">ສັນຕິພາບ ອິດສາລະພາບ ປະຊາທິປະໄຕ ເອກະພາບ ວັດທະນະຖາວອນ</p>
                <div className="pt-4">
                  <h2 className="font-bold text-lg uppercase decoration-2">
                    {reportType === "incomes" && "ບົດລາຍງານລາຍຮັບ"}
                    {reportType === "expenses" && "ບົດລາຍງານລາຍຈ່າຍ"}
                    {reportType === "budgets" && "ບົດລາຍງານງົບປະມານໂຄງການ"}
                    {reportType === "assets" && "ບົດລາຍງານຊັບສິນລັດ"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    ປະຈຳຊ່ວງວັນທີ: {startDate} ຫາ {endDate}
                  </p>
                </div>
              </div>

              {/* 1. ຕາຕະລາງ ລາຍຮັບ */}
              {reportType === "incomes" && (
                <table className="w-full text-left text-xs border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="p-2.5 border border-slate-300 text-center w-12">ລຳດັບ</th>
                      <th className="p-2.5 border border-slate-300">ວັນທີ</th>
                      <th className="p-2.5 border border-slate-300">ເລກບິນ</th>
                      <th className="p-2.5 border border-slate-300">ເນື້ອໃນລາຍການ</th>
                      <th className="p-2.5 border border-slate-300">ໝວດໝູ່</th>
                      <th className="p-2.5 border border-slate-300 text-right">ຈຳນວນເງິນ (ກີບ)</th>
                      <th className="p-2.5 border border-slate-300">ຜູ້ມອບເງິນ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomeReports.map((item, index) => (
                      <tr key={item.id}>
                        <td className="p-2.5 border border-slate-300 text-center font-bold">{index + 1}</td>
                        <td className="p-2.5 border border-slate-300">{item.date}</td>
                        <td className="p-2.5 border border-slate-300 font-bold text-green-700">{item.code}</td>
                        <td className="p-2.5 border border-slate-300 font-bold">{item.title}</td>
                        <td className="p-2.5 border border-slate-300">{item.category}</td>
                        <td className="p-2.5 border border-slate-300 text-right font-black text-green-700">{item.amount.toLocaleString()}</td>
                        <td className="p-2.5 border border-slate-300">{item.payer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* 2. ຕາຕະລາງ ລາຍຈ່າຍ */}
              {reportType === "expenses" && (
                <table className="w-full text-left text-xs border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="p-2.5 border border-slate-300 text-center w-12">ລຳດັບ</th>
                      <th className="p-2.5 border border-slate-300">ວັນທີ</th>
                      <th className="p-2.5 border border-slate-300">ເລກບິນ</th>
                      <th className="p-2.5 border border-slate-300">ເນື້ອໃນລາຍການ</th>
                      <th className="p-2.5 border border-slate-300">ໝວດໝູ່</th>
                      <th className="p-2.5 border border-slate-300 text-right">ຈຳນວນເງິນ (ກີບ)</th>
                      <th className="p-2.5 border border-slate-300">ຜູ້ຮັບເງິນ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenseReports.map((item, index) => (
                      <tr key={item.id}>
                        <td className="p-2.5 border border-slate-300 text-center font-bold">{index + 1}</td>
                        <td className="p-2.5 border border-slate-300">{item.date}</td>
                        <td className="p-2.5 border border-slate-300 font-bold text-red-600">{item.code}</td>
                        <td className="p-2.5 border border-slate-300 font-bold">{item.title}</td>
                        <td className="p-2.5 border border-slate-300">{item.category}</td>
                        <td className="p-2.5 border border-slate-300 text-right font-black text-red-600">{item.amount.toLocaleString()}</td>
                        <td className="p-2.5 border border-slate-300">{item.payee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* 3. ຕາຕະລາງ ງົບປະມານ */}
              {reportType === "budgets" && (
                <table className="w-full text-left text-xs border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="p-2.5 border border-slate-300 text-center w-12">ລຳດັບ</th>
                      <th className="p-2.5 border border-slate-300">ຊື່ໂຄງການ / ງົບປະມານ</th>
                      <th className="p-2.5 border border-slate-300 text-right">ງົບອະນຸມັດ (ກີບ)</th>
                      <th className="p-2.5 border border-slate-300 text-right">ໃຊ້ໄປແລ້ວ (ກີບ)</th>
                      <th className="p-2.5 border border-slate-300 text-right">ຍອດເຫຼືອ (ກີບ)</th>
                      <th className="p-2.5 border border-slate-300 text-center">% ໃຊ້ໄປ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgetReports.map((item, index) => (
                      <tr key={item.id}>
                        <td className="p-2.5 border border-slate-300 text-center font-bold">{index + 1}</td>
                        <td className="p-2.5 border border-slate-300 font-bold">{item.name}</td>
                        <td className="p-2.5 border border-slate-300 text-right font-bold">{item.total.toLocaleString()}</td>
                        <td className="p-2.5 border border-slate-300 text-right text-red-600 font-bold">{item.used.toLocaleString()}</td>
                        <td className="p-2.5 border border-slate-300 text-right text-green-700 font-bold">{item.remain.toLocaleString()}</td>
                        <td className="p-2.5 border border-slate-300 text-center font-bold">{item.percent}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* 4. ຕາຕະລາງ ຊັບສິນ */}
              {reportType === "assets" && (
                <table className="w-full text-left text-xs border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="p-2.5 border border-slate-300 text-center w-12">ລຳດັບ</th>
                      <th className="p-2.5 border border-slate-300">ລະຫັດຊັບສິນ</th>
                      <th className="p-2.5 border border-slate-300">ຊື່ຊັບສິນ</th>
                      <th className="p-2.5 border border-slate-300">ໝວດໝູ່</th>
                      <th className="p-2.5 border border-slate-300 text-right">ມູນຄ່າ (ກີບ)</th>
                      <th className="p-2.5 border border-slate-300">ຜູ້ຮັບຜິດຊອບ</th>
                      <th className="p-2.5 border border-slate-300">ສະຖານະ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assetReports.map((item, index) => (
                      <tr key={item.id}>
                        <td className="p-2.5 border border-slate-300 text-center font-bold">{index + 1}</td>
                        <td className="p-2.5 border border-slate-300 font-bold text-green-700">{item.code}</td>
                        <td className="p-2.5 border border-slate-300">{item.name}</td>
                        <td className="p-2.5 border border-slate-300">{item.category}</td>
                        <td className="p-2.5 border border-slate-300 text-right font-bold">{item.price.toLocaleString()}</td>
                        <td className="p-2.5 border border-slate-300">{item.user}</td>
                        <td className="p-2.5 border border-slate-300">{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Footer ສຳລັບລາຍເຊັນທາງການ */}
              <div className="pt-12 grid grid-cols-2 text-center text-xs font-bold gap-8">
                <div>
                  <p>ຜູ້ລາຍງານ</p>
                  <div className="h-20" />
                  <p>................................................</p>
                </div>
                <div>
                  <p>ຫົວໜ້າກົມ</p>
                  <div className="h-20" />
                  <p>................................................</p>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}