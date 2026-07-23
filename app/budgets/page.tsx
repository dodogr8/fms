"use client";

import { useState, useEffect, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { 
  Plus, 
  Search, 
  PieChart, 
  Trash2, 
  Edit, 
  X,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react";
import { formatNumberInput, parseFormattedNumber } from "@/lib/formatters";

interface BudgetItem {
  id: number;
  projectName: string;
  categoryName: string;
  totalAmount: number;
  adminFee: number;
  netAmount: number;
  usedAmount: number;
  startDate: string;
  endDate: string;
  detail: string;
}

export default function BudgetsPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [userRole, setUserRole] = useState<"ADMIN" | "DIRECTOR" | "FINANCE_STAFF" | "ASSET_STAFF">("ADMIN");

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // Checkbox & Bulk
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Pagination
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    projectName: "",
    categoryName: "ໂຄງການພັດທະນາ",
    totalAmount: "",
    deductType: "percent" as "percent" | "amount",
    deductValue: "0",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    detail: "",
  });

  useEffect(() => {
    fetchBudgets();

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

  const fetchBudgets = async () => {
    try {
      const res = await fetch("/api/budgets");
      if (res.ok) {
        const data = await res.json();
        setBudgets(data);
      }
    } catch (err) {
      console.error("Fetch Budgets Error:", err);
    }
  };

  // Realtime Filter
  const filteredBudgets = useMemo(() => {
    return budgets.filter((item) => {
      const matchSearch =
        (item.projectName && item.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.categoryName && item.categoryName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory = filterCategory ? item.categoryName?.toLowerCase().includes(filterCategory.toLowerCase()) : true;

      return matchSearch && matchCategory;
    });
  }, [budgets, searchTerm, filterCategory]);

  // Pagination
  const totalPages = Math.ceil(filteredBudgets.length / pageSize) || 1;
  const paginatedBudgets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBudgets.slice(start, start + pageSize);
  }, [filteredBudgets, currentPage, pageSize]);

  // Checkbox Select All
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedBudgets.map((i) => i.id));
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
      projectName: "",
      categoryName: "ໂຄງການພັດທະນາ",
      totalAmount: "",
      deductType: "percent",
      deductValue: "0",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      detail: "",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: BudgetItem) => {
    setEditingId(item.id);
    setFormData({
      projectName: item.projectName || "",
      categoryName: item.categoryName || "ໂຄງການພັດທະນາ",
      totalAmount: formatNumberInput(item.totalAmount.toString()), // 💡 ໃສ່ຈຸດອັດຕະໂນມັດຕອນເປີດ Modal ແກ້ໄຂ
      deductType: "percent",
      deductValue: "0",
      startDate: item.startDate || new Date().toISOString().split("T")[0],
      endDate: item.endDate || "",
      detail: item.detail || "",
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectName || !formData.totalAmount) {
      alert("ກະລຸນາປ້ອນຊື່ໂຄງການ ແລະ ງົບປະມານລວມ!");
      return;
    }

    try {
      const isEdit = editingId !== null;
      const url = isEdit ? `/api/budgets/${editingId}` : "/api/budgets";
      const method = isEdit ? "PUT" : "POST";

      // 💡 ແປງຈຳນວນເງິນທີ່ມີຈຸດ ເປັນ pure number ກ່ອນສົ່ງໄປ API
      const payload = {
        ...formData,
        totalAmount: parseFormattedNumber(formData.totalAmount),
        deductValue: formData.deductType === "amount" 
          ? parseFormattedNumber(formData.deductValue) 
          : parseFloat(formData.deductValue) || 0,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchBudgets();
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
    if (!confirm("ທ່ານຕ້ອງການລົບໂຄງການນີ້ແທ້ຫຼືບໍ່?")) return;
    try {
      const res = await fetch(`/api/budgets/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchBudgets();
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
    if (!confirm(`ທ່ານຕ້ອງການລົບ ${selectedIds.length} ໂຄງການທີ່ເລືອກແທ້ຫຼືບໍ່?`)) return;

    try {
      const res = await fetch("/api/budgets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (res.ok) {
        fetchBudgets();
        setSelectedIds([]);
        alert("ລົບລາຍການທີ່ເລືອກສຳເລັດ!");
      } else {
        alert("ລົບຂໍ້ມູນບໍ່ສຳເລັດ!");
      }
    } catch (err) {
      alert("ເກີດຂໍ້ຜິດພາດ!");
    }
  };

  const totalBudget = budgets.reduce((sum, item) => sum + Number(item.totalAmount), 0);

  return (
    <div className="flex w-full min-h-screen bg-slate-50 overflow-x-hidden">
      <Sidebar userRole={userRole} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Navbar 
          title="ຄຸ້ມຄອງງົບປະມານ (Budgets)" 
          userName="ຜູ້ໃຊ້ງານລະບົບ" 
          userRole={userRole} 
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />

        <main className="p-6 space-y-6 w-full max-w-full overflow-hidden">
          {/* Header Card Summary */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                <PieChart className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">ງົບປະມານອະນຸມັດລວມທັງໝົດ</p>
                <h2 className="text-3xl font-black text-slate-900">{totalBudget.toLocaleString()} ກີບ</h2>
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
                  onClick={handleOpenAdd}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>ເພີ່ມງົບປະມານໂຄງການ</span>
                </button>
              </div>
            )}
          </div>

          {/* Search & Filters */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-4 p-5 w-full overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ຄົ້ນຫາ Realtime (ຊື່ໂຄງການ, ໝວດໝູ່)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
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
                  className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value={10}>10 ແຖວ</option>
                  <option value={20}>20 ແຖວ</option>
                  <option value={50}>50 ແຖວ</option>
                  <option value={100}>100 ແຖວ</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <div className="flex items-center gap-2 max-w-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="ກັ່ນຕອງ ໝວດໝູ່..."
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full p-2 bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Table */}
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
                            paginatedBudgets.length > 0 &&
                            paginatedBudgets.every((i) => selectedIds.includes(i.id))
                          }
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </th>
                    )}
                    <th className="py-3.5 px-4 text-center w-12">ລຳດັບ</th>
                    <th className="py-3.5 px-4 min-w-[200px]">ຊື່ໂຄງການ / ງົບປະມານ</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">ໝວດໝູ່</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">ງົບອະນຸມັດ (ກີບ)</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">ຕັດບໍລິຫານ (ກີບ)</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">ງົບໂຄງການຕົວຈິງ (ກີບ)</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">ໃຊ້ໄປແລ້ວ (ກີບ)</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">ງົບເຫຼືອ (ກີບ)</th>
                    {userRole !== "DIRECTOR" && <th className="py-3.5 px-4 text-center whitespace-nowrap">ຈັດການ</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {paginatedBudgets.length > 0 ? (
                    paginatedBudgets.map((item, index) => {
                      const remain = Number(item.netAmount) - Number(item.usedAmount);
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          {userRole !== "DIRECTOR" && (
                            <td className="py-3.5 px-4 text-center">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(item.id)}
                                onChange={() => handleSelectOne(item.id)}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                            </td>
                          )}
                          <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                            {(currentPage - 1) * pageSize + index + 1}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">{item.projectName}</td>
                          <td className="py-3.5 px-4 whitespace-nowrap">{item.categoryName}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">{Number(item.totalAmount).toLocaleString()}</td>
                          <td className="py-3.5 px-4 font-semibold text-green-700 whitespace-nowrap">{Number(item.adminFee).toLocaleString()}</td>
                          <td className="py-3.5 px-4 font-bold text-blue-700 whitespace-nowrap">{Number(item.netAmount).toLocaleString()}</td>
                          <td className="py-3.5 px-4 font-semibold text-red-600 whitespace-nowrap">{Number(item.usedAmount).toLocaleString()}</td>
                          <td className="py-3.5 px-4 font-black text-emerald-700 whitespace-nowrap">{remain.toLocaleString()}</td>
                          
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
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={userRole !== "DIRECTOR" ? 10 : 9} className="py-12 text-center text-slate-400">
                        ບໍ່ພົບຂໍ້ມູນງົບປະມານໃນ Database
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
              <span>
                ສະແດງ {(currentPage - 1) * pageSize + 1} ຫາ {Math.min(currentPage * pageSize, filteredBudgets.length)} ຈາກທັງໝົດ {filteredBudgets.length} ລາຍການ
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

      {/* Modal ເພີ່ມ / ແກ້ໄຂ ງົບປະມານ */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-800">
                {editingId ? "ແກ້ໄຂຂໍ້ມູນງົບປະມານ" : "ເພີ່ມງົບປະມານໂຄງການໃໝ່"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700">ຊື່ໂຄງການ / ງົບປະມານ *</label>
                <input
                  type="text"
                  placeholder="ປ້ອນຊື່ໂຄງການ..."
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700">ໝວດໝູ່</label>
                  <select
                    value={formData.categoryName}
                    onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                    className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="ໂຄງການພັດທະນາ">ໂຄງການພັດທະນາ</option>
                    <option value="ງົບປະມານບໍລິຫານ">ງົບປະມານບໍລິຫານ</option>
                    <option value="ງົບປະມານຈັດຊື້">ງົບປະມານຈັດຊື້</option>
                  </select>
                </div>
                {/* 💡 ຊ່ອງປ້ອນງົບປະມານລວມ ໃສ່ຈຸດອັດຕະໂນມັດຕອນພິມ */}
                <div>
                  <label className="font-bold text-slate-700">ງົບປະມານອະນຸມັດລວມ (ກີບ) *</label>
                  <input
                    type="text"
                    placeholder="0"
                    value={formData.totalAmount}
                    onChange={(e) => {
                      const formatted = formatNumberInput(e.target.value);
                      setFormData({ ...formData, totalAmount: formatted });
                    }}
                    className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>
              </div>

              {!editingId && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-2xl space-y-3">
                  <label className="font-bold text-green-900 text-xs block">
                    💡 ຫັກເງິນບໍລິຫານ (%) ເຂົ້າຄັງເງິນລາຍຮັບອັດຕະໂນມັດ:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={formData.deductType}
                      onChange={(e) => {
                        const newType = e.target.value as "percent" | "amount";
                        setFormData({ 
                          ...formData, 
                          deductType: newType,
                          deductValue: "0" 
                        });
                      }}
                      className="p-2.5 bg-white border border-green-300 rounded-xl text-xs font-semibold"
                    >
                      <option value="percent">ຫັກເປັນ ເປີເຊັນ (%)</option>
                      <option value="amount">ຫັກເປັນ ຈຳນວນເງິນ (ກີບ)</option>
                    </select>

                    {/* 💡 ຊ່ອງປ້ອນເງິນຕັດບໍລິຫານ ໃສ່ຈຸດອັດຕະໂນມັດ (ຖ້າເລືອກເປັນຈຳນວນເງິນ) */}
                    <input
                      type="text"
                      placeholder="0"
                      value={formData.deductValue}
                      onChange={(e) => {
                        const val = formData.deductType === "amount" 
                          ? formatNumberInput(e.target.value) 
                          : e.target.value;
                        setFormData({ ...formData, deductValue: val });
                      }}
                      className="p-2.5 bg-white border border-green-300 rounded-xl text-xs font-bold text-green-700"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700">ວັນທີເລີ່ມຕົ້ນ</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">ວັນທີສິ້ນສຸດ</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">ລາຍລະອຽດເພີ່ມເຕີມ</label>
                <textarea
                  placeholder="ລາຍລະອຽດ..."
                  value={formData.detail}
                  onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                  className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 h-20"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  ຍົກເລີກ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20"
                >
                  {editingId ? "ອັບເດດຂໍ້ມູນ" : "ບັນທຶກລົງ Database"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}