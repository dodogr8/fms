"use client";

import { useState, useEffect, useMemo } from "react";
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
  Upload,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react";
import * as XLSX from "xlsx";
import { formatNumberInput, parseFormattedNumber } from "@/lib/formatters";

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
  const [userRole, setUserRole] = useState<"ADMIN" | "DIRECTOR" | "FINANCE_STAFF" | "ASSET_STAFF">("ADMIN");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRef, setFilterRef] = useState("");
  const [filterDisburser, setFilterDisburser] = useState("");
  const [filterReceiver, setFilterReceiver] = useState("");

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
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

  useEffect(() => {
    fetchIncomes();

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

  const filteredIncomes = useMemo(() => {
    return incomes.filter((item) => {
      const matchSearch =
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.referenceNo && item.referenceNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.disburser && item.disburser.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.receiver && item.receiver.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchRef = filterRef ? item.referenceNo?.toLowerCase().includes(filterRef.toLowerCase()) : true;
      const matchDisburser = filterDisburser ? item.disburser?.toLowerCase().includes(filterDisburser.toLowerCase()) : true;
      const matchReceiver = filterReceiver ? item.receiver?.toLowerCase().includes(filterReceiver.toLowerCase()) : true;

      return matchSearch && matchRef && matchDisburser && matchReceiver;
    });
  }, [incomes, searchTerm, filterRef, filterDisburser, filterReceiver]);

  const totalPages = Math.ceil(filteredIncomes.length / pageSize) || 1;
  const paginatedIncomes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredIncomes.slice(start, start + pageSize);
  }, [filteredIncomes, currentPage, pageSize]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedIncomes.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      referenceNo: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      disburser: "",
      receiver: "",
      amount: "",
      remark: "",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: IncomeTransaction) => {
    setEditingId(item.id);
    setFormData({
      referenceNo: item.referenceNo || "",
      date: item.date || new Date().toISOString().split("T")[0],
      description: item.description || "",
      disburser: item.disburser || "",
      receiver: item.receiver || "",
      amount: formatNumberInput(item.amount.toString()), // 💡 ໃສ່ຈຸດໃຫ້ຕອນດຶງມາແກ້ໄຂ
      remark: item.remark || "",
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) {
      alert("ກະລຸນາປ້ອນເນື້ອໃນລາຍການ ແລະ ຈຳນວນເງິນ!");
      return;
    }

    try {
      const isEdit = editingId !== null;
      const url = isEdit ? `/api/incomes/${editingId}` : "/api/incomes";
      const method = isEdit ? "PUT" : "POST";

      // 💡 ແປງຈຳນວນເງິນທີ່ມີຈຸດ ເປັນ ໂຕເລກ pure number ກ່ອນສົ່ງລົງ API
      const payload = {
        ...formData,
        amount: parseFormattedNumber(formData.amount),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchIncomes();
        setShowModal(false);
        alert(isEdit ? "ແກ້ໄຂຂໍ້ມູນສຳເລັດ!" : "ບັນທຶກຂໍ້ມູນສຳເລັດ!");
      } else {
        alert("ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ!");
      }
    } catch (err) {
      alert("ບໍ່ສາມາດເຊື່ອມຕໍ່ Server ໄດ້!");
    }
  };

  const handleDeleteOne = async (id: number) => {
    if (!confirm("ທ່ານຕ້ອງການລົບລາຍການນີ້ແທ້ຫຼືບໍ່?")) return;
    try {
      const res = await fetch(`/api/incomes/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchIncomes();
        setSelectedIds(selectedIds.filter((i) => i !== id));
      } else {
        alert("ລົບຂໍ້ມູນບໍ່ສຳເລັດ!");
      }
    } catch (err) {
      alert("ເກີດຂໍ້ຜິດພາດ!");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`ທ່ານຕ້ອງການລົບ ${selectedIds.length} ລາຍການທີ່ເລືອກແທ້ຫຼືບໍ່?`)) return;

    try {
      const res = await fetch("/api/incomes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (res.ok) {
        fetchIncomes();
        setSelectedIds([]);
        alert("ລົບລາຍການທີ່ເລືອກສຳເລັດ!");
      } else {
        alert("ລົບຂໍ້ມູນບໍ່ສຳເລັດ!");
      }
    } catch (err) {
      alert("ເກີດຂໍ້ຜິດພາດ!");
    }
  };

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

  return (
    <div className="flex w-full min-h-screen bg-slate-50 overflow-x-hidden">
      <Sidebar userRole={userRole} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Navbar 
          title="ຈັດການລາຍຮັບ (Incomes)" 
          userName="ຜູ້ໃຊ້ງານລະບົບ" 
          userRole={userRole} 
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />

        <main className="p-6 space-y-6 w-full max-w-full overflow-hidden">
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

            {userRole !== "DIRECTOR" && (
              <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
                {selectedIds.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-red-600/20 transition-all animate-pulse"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>ລົບ {selectedIds.length} ລາຍການ</span>
                  </button>
                )}

                <button
                  onClick={() => setShowImportModal(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-xl border border-emerald-200 transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Import Excel</span>
                </button>

                <button
                  onClick={handleOpenAdd}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-green-600/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>ເພີ່ມລາຍຮັບໃໝ່</span>
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-4 p-5 w-full overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ຄົ້ນຫາ Realtime (ເລກບິນ, ເນື້ອໃນ, ຜູ້ເບີກ, ຜູ້ຮັບ)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                />
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 w-full md:w-auto justify-end">
                <span>ສະແດງ:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  <option value={10}>10 ແຖວ</option>
                  <option value={20}>20 ແຖວ</option>
                  <option value={50}>50 ແຖວ</option>
                  <option value={100}>100 ແຖວ</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="ກັ່ນຕອງ ເລກບິນ..."
                  value={filterRef}
                  onChange={(e) => setFilterRef(e.target.value)}
                  className="w-full p-2 bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="ກັ່ນຕອງ ຜູ້ເບີກເງິນ..."
                  value={filterDisburser}
                  onChange={(e) => setFilterDisburser(e.target.value)}
                  className="w-full p-2 bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="ກັ່ນຕອງ ຜູ້ຮັບເງິນ..."
                  value={filterReceiver}
                  onChange={(e) => setFilterReceiver(e.target.value)}
                  className="w-full p-2 bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600"
                />
              </div>
            </div>

            <div className="w-full overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-sm text-slate-600 border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider">
                    {userRole !== "DIRECTOR" && (
                      <th className="py-3.5 px-4 text-center w-10">
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={
                            paginatedIncomes.length > 0 &&
                            paginatedIncomes.every((i) => selectedIds.includes(i.id))
                          }
                          className="w-4 h-4 rounded text-green-600 focus:ring-green-500 cursor-pointer"
                        />
                      </th>
                    )}
                    <th className="py-3.5 px-4 text-center w-12">ລຳດັບ</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">ເລກບິນສັ່ງຈ່າຍ</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">ວັນທີ ເດືອນ ປີ</th>
                    <th className="py-3.5 px-4 min-w-[200px]">ເນື້ອໃນລາຍການ</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">ຜູ້ເບີກເງິນ</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">ຜູ້ຮັບເງິນ</th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap">ຈຳນວນເງິນ (ກີບ)</th>
                    <th className="py-3.5 px-4">ໝາຍເຫດ</th>
                    {userRole !== "DIRECTOR" && <th className="py-3.5 px-4 text-center whitespace-nowrap">ຈັດການ</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {paginatedIncomes.length > 0 ? (
                    paginatedIncomes.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        {userRole !== "DIRECTOR" && (
                          <td className="py-3.5 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(item.id)}
                              onChange={() => handleSelectOne(item.id)}
                              className="w-4 h-4 rounded text-green-600 focus:ring-green-500 cursor-pointer"
                            />
                          </td>
                        )}
                        <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-green-700 whitespace-nowrap">{item.referenceNo || "-"}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{item.date}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{item.description}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{item.disburser || "-"}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{item.receiver || "-"}</td>
                        <td className="py-3.5 px-4 text-right font-black text-green-700 whitespace-nowrap">
                          {Number(item.amount).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-400 max-w-xs truncate">{item.remark || "-"}</td>
                        
                        {userRole !== "DIRECTOR" && (
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <div className="flex justify-center items-center gap-1">
                              <button
                                onClick={() => handleOpenEdit(item)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all"
                                title="ແກ້ໄຂ"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteOne(item.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all"
                                title="ລົບ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={userRole !== "DIRECTOR" ? 10 : 8} className="py-12 text-center text-slate-400">
                        ບໍ່ພົບຂໍ້ມູນລາຍຮັບໃນ Database
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
              <span>
                ສະແດງ {(currentPage - 1) * pageSize + 1} ຫາ {Math.min(currentPage * pageSize, filteredIncomes.length)} ຈາກທັງໝົດ {filteredIncomes.length} ລາຍການ
              </span>

              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="p-2 border rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 font-bold text-slate-800">
                  ໜ້າ {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="p-2 border rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal ເພີ່ມ / ແກ້ໄຂ ລາຍຮັບ */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="font-bold text-lg text-slate-800">
                {editingId ? "ແກ້ໄຂຂໍ້ມູນລາຍຮັບ" : "ເພີ່ມລາຍການລາຍຮັບໃໝ່"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
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

              {/* 💡 ຊ່ອງປ້ອນຈຳນວນເງິນ ໃສ່ຈຸດອັດຕະໂນມັດ 1,000,000 */}
              <div>
                <label className="font-bold text-slate-700">ຈຳນວນເງິນ (ກີບ) *</label>
                <input
                  type="text"
                  placeholder="0"
                  value={formData.amount}
                  onChange={(e) => {
                    const formatted = formatNumberInput(e.target.value);
                    setFormData({ ...formData, amount: formatted });
                  }}
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
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  ຍົກເລີກ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/20"
                >
                  {editingId ? "ອັບເດດຂໍ້ມູນ" : "ບັນທຶກລົງ Database"}
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