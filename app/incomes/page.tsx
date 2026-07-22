"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { 
  Plus, 
  FileSpreadsheet, 
  Search, 
  TrendingUp, 
  Trash2, 
  Edit, 
  X,
  Upload
} from "lucide-react";
import * as XLSX from "xlsx";

interface IncomeTransaction {
  id: number;
  referenceNo: string;
  date: string;
  description: string;
  disburser: string;
  receiver: string;
  amount: number;
  remark: string;
}

export default function IncomesPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [incomes, setIncomes] = useState<IncomeTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const [formData, setFormData] = useState({
    referenceNo: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    disburser: "",
    receiver: "",
    amount: "",
    remark: "",
  });

  // 💡 ດຶງຂໍ້ມູນລາຍຮັບຈາກ Database ຈິງ
  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      const res = await fetch("/api/incomes");
      if (res.ok) {
        const data = await res.json();
        setIncomes(data);
      }
    } catch (err) {
      console.error("Fetch Incomes Error:", err);
    }
  };

  // 💡 ບັນທຶກຂໍ້ມູນລົງ Database ຈິງ
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) {
      alert("ກະລຸນາປ້ອນເນື້ອໃນລາຍການ ແລະ ຈຳນວນເງິນ!");
      return;
    }

    try {
      const res = await fetch("/api/incomes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchIncomes(); // Refresh ຂໍ້ມູນຈາກ Database
        setShowAddModal(false);
        setFormData({
          referenceNo: "",
          date: new Date().toISOString().split("T")[0],
          description: "",
          disburser: "",
          receiver: "",
          amount: "",
          remark: "",
        });
      } else {
        alert("ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ!");
      }
    } catch (err) {
      alert("ບໍ່ສາມາດເຊື່ອມຕໍ່ Server ໄດ້!");
    }
  };

  // Import Excel
  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[];

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row && row.length > 0 && row[3]) {
          await fetch("/api/incomes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              referenceNo: row[1]?.toString() || "",
              date: row[2]?.toString() || new Date().toISOString().split("T")[0],
              description: row[3]?.toString() || "",
              disburser: row[4]?.toString() || "",
              receiver: row[5]?.toString() || "",
              amount: parseFloat(row[6]) || 0,
              remark: row[7]?.toString() || "",
            }),
          });
        }
      }

      fetchIncomes();
      alert("Import ຂໍ້ມູນລົງ Database ສຳເລັດ!");
      setShowImportModal(false);
    };
    reader.readAsBinaryString(file);
  };

  const totalAmount = incomes.reduce((sum, item) => sum + Number(item.amount), 0);

  const filteredIncomes = incomes.filter(
    (item) =>
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.referenceNo && item.referenceNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.disburser && item.disburser.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex w-full min-h-screen bg-slate-50 overflow-x-hidden">
      <Sidebar 
        userRole="ADMIN" 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Navbar 
          title="ຈັດການລາຍຮັບ (Incomes)" 
          userName="ຜູ້ບໍລິຫານລະບົບ" 
          userRole="ADMIN" 
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />

        <main className="p-6 space-y-6 w-full max-w-full overflow-hidden">
          {/* Header Card Summary */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-green-50 text-green-600 rounded-2xl border border-green-100">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">ຍອດລວມລາຍຮັບທັງໝົດ</p>
                <h2 className="text-3xl font-black text-green-700">{totalAmount.toLocaleString()} ກີບ</h2>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-xl border border-emerald-200 transition-all"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Import Excel</span>
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-green-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>ເພີ່ມລາຍຮັບໃໝ່</span>
              </button>
            </div>
          </div>

          {/* Search & Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-4 p-5 w-full overflow-hidden">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ຄົ້ນຫາຕາມ ເລກບິນ, ເນື້ອໃນ ຫຼື ຜູ້ເບີກເງິນ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                />
              </div>

              <span className="text-xs font-medium text-slate-500">
                ທັງໝົດ: <strong className="text-slate-800">{filteredIncomes.length}</strong> ລາຍການ
              </span>
            </div>

            {/* Table */}
            <div className="w-full overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-sm text-slate-600 border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-4 text-center w-16">ລຳດັບ</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">ເລກບິນສັ່ງຈ່າຍ</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">ວັນທີ ເດືອນ ປີ</th>
                    <th className="py-3.5 px-4 min-w-[200px]">ເນື້ອໃນລາຍການ</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">ຜູ້ເບີກເງິນ</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">ຜູ້ຮັບເງິນ</th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap">ຈຳນວນເງິນ (ກີບ)</th>
                    <th className="py-3.5 px-4">ໝາຍເຫດ</th>
                    <th className="py-3.5 px-4 text-center whitespace-nowrap">ຈັດການ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredIncomes.length > 0 ? (
                    filteredIncomes.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 text-center font-bold text-slate-400">{index + 1}</td>
                        <td className="py-3.5 px-4 font-semibold text-green-700 whitespace-nowrap">{item.referenceNo || "-"}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{item.date}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{item.description}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{item.disburser || "-"}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{item.receiver || "-"}</td>
                        <td className="py-3.5 px-4 text-right font-black text-green-700 whitespace-nowrap">
                          {Number(item.amount).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-400 max-w-xs truncate">{item.remark || "-"}</td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex justify-center items-center gap-1">
                            <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        ບໍ່ພົບຂໍ້ມູນລາຍຮັບໃນ Database
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modal ເພີ່ມລາຍຮັບໃໝ່ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="font-bold text-lg text-slate-800">ເພີ່ມລາຍການລາຍຮັບໃໝ່</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700">ເລກບິນສັ່ງຈ່າຍ</label>
                  <input
                    type="text"
                    placeholder="INC-2026-001"
                    value={formData.referenceNo}
                    onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                    className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">ວັນທີ ເດືອນ ປີ *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">ເນື້ອໃນລາຍການ *</label>
                <input
                  type="text"
                  placeholder="ປ້ອນເນື້ອໃນການຮັບເງິນ..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700">ຜູ້ເບີກເງິນ</label>
                  <input
                    type="text"
                    placeholder="ຊື່ຜູ້ເບີກ..."
                    value={formData.disburser}
                    onChange={(e) => setFormData({ ...formData, disburser: e.target.value })}
                    className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">ຜູ້ຮັບເງິນ</label>
                  <input
                    type="text"
                    placeholder="ຊື່ຜູ້ຮັບ..."
                    value={formData.receiver}
                    onChange={(e) => setFormData({ ...formData, receiver: e.target.value })}
                    className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">ຈຳນວນເງິນ (ກີບ) *</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm font-bold text-green-700 focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">ໝາຍເຫດ</label>
                <textarea
                  placeholder="ຂໍ້ຄວາມເພີ່ມເຕີມ..."
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 h-20"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  ຍົກເລີກ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/20"
                >
                  ບັນທຶກລົງ Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Import Excel */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="font-bold text-lg text-slate-800">Import ຂໍ້ມູນລາຍຮັບຈາກ Excel</h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                <p className="font-bold">📌 ຮູບແບບ Excel ທີ່ຮອງຮັບ (8 ຖັນ):</p>
                <p>1. ລໍາດັບ | 2. ເລກບິນສັ່ງຈ່າຍ | 3. ວັນທີ | 4. ເນື້ອໃນ | 5. ຜູ້ເບີກເງິນ | 6. ຜູ້ຮັບເງິນ | 7. ຈໍານວນເງິນ | 8. ໝາຍເຫດ</p>
              </div>

              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl cursor-pointer transition-all">
                <Upload className="w-10 h-10 text-emerald-600 mb-2" />
                <span className="text-sm font-bold text-emerald-800">ເລືອກໄຟລ໌ Excel (.xlsx, .xls)</span>
                <span className="text-xs text-slate-400 mt-1">ຄລິກເພື່ອອັບໂຫລດລົງ DB</span>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleExcelImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}