"use client";

import { useState, useRef } from "react";
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [reportType, setReportType] = useState<"incomes" | "expenses" | "budgets" | "assets">("incomes");
  
  // State ສຳລັບ Filter ວັນທີ
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  // Ref ສຳລັບການ ພິມ / Save PDF
  const printRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `GFMS-Report-${reportType}`,
  });

  // ຂໍ້ມູນຕົວຢ່າງສຳລັບລາຍງານ
  const sampleIncomes = [
    { date: "2026-07-20", refNo: "INC-2026-001", title: "ຮັບເງິນງົບປະມານບໍລິຫານປະຈຳເດືອນ 7", amount: 50000000, remark: "ໂອນເຂົ້າບັນຊີຄັງ" },
    { date: "2026-07-22", refNo: "INC-2026-002", title: "ລາຍຮັບວິຊາການ ຄ່າທຳນຽມບໍລິການ", amount: 12500000, remark: "ເງິນສົດ" },
    { date: "2026-07-23", refNo: "INC-2026-003", title: "ຫັກເງິນບໍລິຫານຈາກໂຄງການສຳຫຼວດ", amount: 20000000, remark: "ສ່ວນແບ່ງ 10%" },
  ];

  const sampleExpenses = [
    { date: "2026-07-21", refNo: "EXP-2026-001", title: "ຈ່າຍຄ່າໄຟຟ້າ ແລະ ນ້ຳປະປາ ປະຈຳເດືອນ 6", amount: 4500000, remark: "ໃບບິນທີ 8892" },
    { date: "2026-07-22", refNo: "EXP-2026-002", title: "ຊື້ເຄື່ອງຂຽນ ແລະ ອຸປະກອນຫ້ອງການ", amount: 1850000, remark: "ເງິນສົດ" },
  ];

  const sampleAssets = [
    { code: "COM-2026-001", name: "ຄອມພິວເຕີຕັ້ງໂຕະ Dell OptiPlex", category: "ອຸປະກອນ IT", price: 12500000, user: "ທ່ານ ສົມໄຊ", status: "ກຳລັງນຳໃຊ້" },
    { code: "PRN-2026-002", name: "ເຄື່ອງພິມ Laser Canon LBP2900", category: "ອຸປະກອນ IT", price: 3500000, user: "ຫ້ອງການບໍລິຫານ", status: "ວ່າງ/ພ້ອມໃຊ້" },
  ];

  // ຟັງຊັນ Export ຕາຕະລາງໄປ Excel
  const handleExportExcel = () => {
    let exportData: any[] = [];
    if (reportType === "incomes") exportData = sampleIncomes;
    else if (reportType === "expenses") exportData = sampleExpenses;
    else if (reportType === "assets") exportData = sampleAssets;

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `GFMS_${reportType}_Report.xlsx`);
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
          title="ອອກບົດລາຍງານ (Reports)" 
          userName="ຜູ້ບໍລິຫານລະບົບ" 
          userRole="ADMIN" 
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />

        <main className="p-6 space-y-6 w-full max-w-full overflow-hidden">
          {/* Controls Bar */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">ລະບົບລາຍງານ (Report)</h2>
                <p className="text-xs text-slate-500 mt-1">ເລືອກປະເພດບົດລາຍງານ ແລະ ໄລຍະເວລາທີ່ຕ້ອງການອອກເອກະສານ</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2.5 w-full lg:w-auto">
                <button
                  onClick={handleExportExcel}
                  className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-xl border border-emerald-200 transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Export Excel</span>
                </button>

                <button
                  onClick={() => handlePrint()}
                  className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-green-600/20 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>ພິມ / Save PDF</span>
                </button>
              </div>
            </div>

            {/* Filter Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              {/* Report Type Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  ປະເພດບົດລາຍງານ
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setReportType("incomes")}
                    className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                      reportType === "incomes"
                        ? "bg-green-600 text-white border-green-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>ລາຍງານລາຍຮັບ</span>
                  </button>

                  <button
                    onClick={() => setReportType("expenses")}
                    className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                      reportType === "expenses"
                        ? "bg-red-600 text-white border-red-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <TrendingDown className="w-4 h-4" />
                    <span>ລາຍງານລາຍຈ່າຍ</span>
                  </button>

                  <button
                    onClick={() => setReportType("budgets")}
                    className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                      reportType === "budgets"
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <PieChart className="w-4 h-4" />
                    <span>ງົບປະມານ</span>
                  </button>

                  <button
                    onClick={() => setReportType("assets")}
                    className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                      reportType === "assets"
                        ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    <span>ລາຍງານຊັບສິນ</span>
                  </button>
                </div>
              </div>

              {/* Date Filters */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  ແຕ່ວັນທີ
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  ຫາວັນທີ
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 📄 Print Preview Component (ພື້ນທີ່ທີ່ຈະຖືກພິມເປັນ PDF) */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm">
            <div ref={printRef} className="p-8 bg-white space-y-6 text-slate-900 font-sans">
              
              {/* Header ບົດລາຍງານທາງການ */}
              <div className="text-center space-y-1 border-b border-slate-300 pb-6">
                <p className="font-bold text-base">ສາທາລະນະລັດ ປະຊາທິປະໄຕ ປະຊາຊົນລາວ</p>
                <p className="font-bold text-base">ສັນຕິພາບ ເອກະລາດ ປະຊາທິປະໄຕ ເອກະພາບ ວັດທະນະຖາວອນ</p>
                <div className="pt-3">
                  <p className="font-bold text-sm text-left">ກະຊວງວັດທະນະທຳ ແລະ ການທ່ອງທ່ຽວ</p>
                  <p className="font-bold text-sm text-left">ກົມຄຸ້ມຄອງການທ່ອງທ່ຽວ</p>
                </div>
                <h1 className="text-xl font-extrabold pt-4 tracking-wide">
                  {reportType === "incomes" && "ບົດລາຍງານລາຍຮັບ"}
                  {reportType === "expenses" && "ບົດລາຍງານລາຍຈ່າຍ"}
                  {reportType === "budgets" && "ບົດລາຍງານຄຸ້ມຄອງງົບປະມານໂຄງການ"}
                  {reportType === "assets" && "ບົດລາຍງານບັນຊີຊັບສິນກົມ"}
                </h1>
                <p className="text-xs text-slate-500">
                  ປະຈຳໄລຍະ: ວັນທີ {startDate} ຫາ {endDate}
                </p>
              </div>

              {/* ຕາຕະລາງສະແດງຂໍ້ມູນລາຍງານ */}
              {reportType === "incomes" && (
                <table className="w-full text-left text-xs border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                      <th className="p-2.5 border border-slate-300 text-center">ລຳດັບ</th>
                      <th className="p-2.5 border border-slate-300">ວັນທີ</th>
                      <th className="p-2.5 border border-slate-300">ເລກບິນ</th>
                      <th className="p-2.5 border border-slate-300">ເນື້ອໃນລາຍການ</th>
                      <th className="p-2.5 border border-slate-300 text-right">ຈຳນວນເງິນ (ກີບ)</th>
                      <th className="p-2.5 border border-slate-300">ໝາຍເຫດ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleIncomes.map((item, index) => (
                      <tr key={index} className="border-b border-slate-200">
                        <td className="p-2.5 border border-slate-300 text-center font-bold">{index + 1}</td>
                        <td className="p-2.5 border border-slate-300">{item.date}</td>
                        <td className="p-2.5 border border-slate-300 font-bold text-green-700">{item.refNo}</td>
                        <td className="p-2.5 border border-slate-300">{item.title}</td>
                        <td className="p-2.5 border border-slate-300 text-right font-bold">
                          {item.amount.toLocaleString()}
                        </td>
                        <td className="p-2.5 border border-slate-300 text-slate-500">{item.remark}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100 font-bold text-sm">
                      <td colSpan={4} className="p-2.5 border border-slate-300 text-right">ຍອດລວມລາຍຮັບທັງໝົດ:</td>
                      <td className="p-2.5 border border-slate-300 text-right text-green-700">
                        {sampleIncomes.reduce((s, i) => s + i.amount, 0).toLocaleString()} ກີບ
                      </td>
                      <td className="p-2.5 border border-slate-300"></td>
                    </tr>
                  </tbody>
                </table>
              )}

              {reportType === "expenses" && (
                <table className="w-full text-left text-xs border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                      <th className="p-2.5 border border-slate-300 text-center">ລຳດັບ</th>
                      <th className="p-2.5 border border-slate-300">ວັນທີ</th>
                      <th className="p-2.5 border border-slate-300">ເລກບິນ</th>
                      <th className="p-2.5 border border-slate-300">ເນື້ອໃນລາຍການ</th>
                      <th className="p-2.5 border border-slate-300 text-right">ຈຳນວນເງິນ (ກີບ)</th>
                      <th className="p-2.5 border border-slate-300">ໝາຍເຫດ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleExpenses.map((item, index) => (
                      <tr key={index} className="border-b border-slate-200">
                        <td className="p-2.5 border border-slate-300 text-center font-bold">{index + 1}</td>
                        <td className="p-2.5 border border-slate-300">{item.date}</td>
                        <td className="p-2.5 border border-slate-300 font-bold text-red-600">{item.refNo}</td>
                        <td className="p-2.5 border border-slate-300">{item.title}</td>
                        <td className="p-2.5 border border-slate-300 text-right font-bold">
                          {item.amount.toLocaleString()}
                        </td>
                        <td className="p-2.5 border border-slate-300 text-slate-500">{item.remark}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100 font-bold text-sm">
                      <td colSpan={4} className="p-2.5 border border-slate-300 text-right">ຍອດລວມລາຍຈ່າຍທັງໝົດ:</td>
                      <td className="p-2.5 border border-slate-300 text-right text-red-600">
                        {sampleExpenses.reduce((s, i) => s + i.amount, 0).toLocaleString()} ກີບ
                      </td>
                      <td className="p-2.5 border border-slate-300"></td>
                    </tr>
                  </tbody>
                </table>
              )}

              {reportType === "assets" && (
                <table className="w-full text-left text-xs border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                      <th className="p-2.5 border border-slate-300 text-center">ລຳດັບ</th>
                      <th className="p-2.5 border border-slate-300">ລະຫັດ</th>
                      <th className="p-2.5 border border-slate-300">ຊື່ຊັບສິນ</th>
                      <th className="p-2.5 border border-slate-300">ໝວດໝູ່</th>
                      <th className="p-2.5 border border-slate-300 text-right">ມູນຄ່າ (ກີບ)</th>
                      <th className="p-2.5 border border-slate-300">ຜູ້ຮັບຜິດຊອບ</th>
                      <th className="p-2.5 border border-slate-300">ສະຖານະ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleAssets.map((item, index) => (
                      <tr key={index} className="border-b border-slate-200">
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