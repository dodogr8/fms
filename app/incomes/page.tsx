"use client";

import { useState, useEffect, useMemo } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { showSuccess, showError, showConfirm } from "../../lib/swal";
import { 
  Plus, 
  FileSpreadsheet, 
  Search, 
  TrendingUp, 
  Trash2, 
  Edit, 
  X,
  Upload,
  Coins,
  Building2,
  Wallet
} from "lucide-react";
import * as XLSX from "xlsx";
import { formatNumberInput, parseFormattedNumber } from "@/lib/formatters";

interface IncomeTransaction {
  id: number;
  referenceNo: string;
  date: string;
  incomeType: "REGULAR" | "FEE_SERVICE";
  categoryName?: string;
  category?: string;
  description: string;
  disburser: string;
  receiver: string;
  amount: number;
  feeAmount: number;
  serviceAmount: number;
  remark: string;
}

interface CategoryItem {
  id: number;
  name: string;
  children: { id: number; name: string }[];
}

export default function IncomesPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [incomes, setIncomes] = useState<IncomeTransaction[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [userRole, setUserRole] = useState<"ADMIN" | "DIRECTOR" | "FINANCE_STAFF" | "ASSET_STAFF">("ADMIN");

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // Checkbox Selection
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Pagination
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    referenceNo: "",
    date: new Date().toISOString().split("T")[0],
    incomeType: "REGULAR" as "REGULAR" | "FEE_SERVICE",
    categoryName: "ລາຍຮັບທົ່ວໄປ",
    description: "",
    disburser: "",
    receiver: "",
    amount: "",
    feeAmount: "0",
    serviceAmount: "0",
    remark: "",
  });

  useEffect(() => {
    fetchIncomes();
    fetchCategories();

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

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories?type=INCOME");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Fetch Categories Error:", err);
    }
  };

  // 💡 ສູດຄິດໄລ່ແຍກ 4 Card ສະຫຼຸບ
  const { regularTotal, feeTotal, serviceTotal, grandTotal } = useMemo(() => {
    let regular = 0;
    let fee = 0;
    let service = 0;

    incomes.forEach((item) => {
      if (item.incomeType === "FEE_SERVICE") {
        fee += Number(item.feeAmount || 0);
        service += Number(item.serviceAmount || 0);
      } else {
        regular += Number(item.amount || 0);
      }
    });

    return {
      regularTotal: regular,
      feeTotal: fee,
      serviceTotal: service,
      grandTotal: regular + fee + service,
    };
  }, [incomes]);

  const filteredIncomes = useMemo(() => {
    return incomes.filter((item) => {
      const cat = item.categoryName || item.category || "";
      const matchSearch =
        (item.referenceNo && item.referenceNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.disburser && item.disburser.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.receiver && item.receiver.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory = filterCategory ? cat === filterCategory : true;

      return matchSearch && matchCategory;
    });
  }, [incomes, searchTerm, filterCategory]);

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
    let defaultCat = "ລາຍຮັບທົ່ວໄປ";
    if (categories.length > 0) {
      defaultCat = categories[0].name;
    }

    setFormData({
      referenceNo: "",
      date: new Date().toISOString().split("T")[0],
      incomeType: "REGULAR",
      categoryName: defaultCat,
      description: "",
      disburser: "",
      receiver: "",
      amount: "",
      feeAmount: "0",
      serviceAmount: "0",
      remark: "",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: IncomeTransaction) => {
    setEditingId(item.id);
    const cat = item.categoryName || item.category || "ລາຍຮັບທົ່ວໄປ";
    const itemType = item.incomeType || "REGULAR";

    setFormData({
      referenceNo: item.referenceNo || "",
      date: item.date || new Date().toISOString().split("T")[0],
      incomeType: itemType,
      categoryName: cat,
      description: item.description || "",
      disburser: item.disburser || "",
      receiver: item.receiver || "",
      amount: formatNumberInput(item.amount ? item.amount.toString() : "0"),
      feeAmount: formatNumberInput(item.feeAmount ? item.feeAmount.toString() : "0"),
      serviceAmount: formatNumberInput(item.serviceAmount ? item.serviceAmount.toString() : "0"),
      remark: item.remark || "",
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description) {
      alert("ກະລຸນາປ້ອນເນື້ອໃນລາຍການ!");
      return;
    }

    try {
      const isEdit = editingId !== null;
      const url = isEdit ? `/api/incomes/${editingId}` : "/api/incomes";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        referenceNo: formData.referenceNo || "",
        date: formData.date || new Date().toISOString().split("T")[0],
        incomeType: formData.incomeType,
        categoryName: formData.categoryName || "ລາຍຮັບທົ່ວໄປ",
        description: formData.description,
        disburser: formData.disburser || "",
        receiver: formData.receiver || "",
        amount: parseFormattedNumber(formData.amount),
        feeAmount: parseFormattedNumber(formData.feeAmount),
        serviceAmount: parseFormattedNumber(formData.serviceAmount),
        remark: formData.remark || "",
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
        const errData = await res.json();
        alert(`ເກີດຂໍ້ຜິດພາດ: ${errData.message || "ບໍ່ສາມາດບັນທຶກໄດ້"}`);
      }
    } catch (err: any) {
      alert(`ບໍ່ສາມາດເຊື່ອມຕໍ່ Server ໄດ້: ${err.message || ""}`);
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

  return (
    <div className="flex w-full min-h-screen bg-slate-50 overflow-x-hidden">
      <Sidebar userRole={userRole} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Navbar 
          title="ຄຸ້ມຄອງລາຍຮັບ (Income)" 
          userName="ຜູ້ໃຊ້ງານລະບົບ" 
          userRole={userRole} 
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />

        <main className="p-6 space-y-6 w-full max-w-full overflow-hidden">
          {/* 💡 4 Cards ແຍກປະເພດລາຍຮັບຊັດເຈນ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: ເງິນໃຊ້ໄດ້ເລີຍ */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ລາຍຮັບບໍລິຫານ (ໃຊ້ໄດ້ເລີຍ)</p>
                <h3 className="text-xl font-black text-emerald-600">{regularTotal.toLocaleString()} ກີບ</h3>
              </div>
            </div>

            {/* Card 2: ຄ່າທຳນຽມ */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ຄ່າທຳນຽມ (ມອບລັດ)</p>
                <h3 className="text-xl font-black text-blue-600">{feeTotal.toLocaleString()} ກີບ</h3>
              </div>
            </div>

            {/* Card 3: ຄ່າບໍລິການ */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ຄ່າບໍລິການ (ວິຊາການ)</p>
                <h3 className="text-xl font-black text-purple-600">{serviceTotal.toLocaleString()} ກີບ</h3>
              </div>
            </div>

            {/* Card 4: ຍອດລວມທັງໝົດ */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-slate-100 text-slate-700 rounded-2xl border border-slate-200">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ຍອດຈັດເກັບໄດ້ທັງໝົດ</p>
                <h3 className="text-xl font-black text-slate-900">{grandTotal.toLocaleString()} ກີບ</h3>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex justify-between items-center">
            <h2 className="font-bold text-slate-800 text-base">ລາຍການຈັດເກັບລາຍຮັບ</h2>

            {userRole !== "DIRECTOR" && (
              <div className="flex gap-2">
                {selectedIds.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>ລົບ {selectedIds.length} ລາຍການ</span>
                  </button>
                )}

                <button
                  onClick={handleOpenAdd}
                  className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-green-600/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>ເພີ່ມລາຍຮັບໃໝ່</span>
                </button>
              </div>
            )}
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-4 p-5 w-full overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-1 items-center gap-3 w-full max-w-xl">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ຄົ້ນຫາ (ເລກບິນ, ເນື້ອໃນ, ຜູ້ເບີກ, ຜູ້ຮັບ)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                  />
                </div>

                <div className="relative w-48">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600"
                  >
                    <option value="">-- ທຸກໝວດໝູ່ --</option>
                    {categories.map((cat) => (
                      <optgroup key={cat.id} label={cat.name}>
                        <option value={cat.name}>{cat.name}</option>
                        {cat.children && cat.children.map((sub) => (
                          <option key={sub.id} value={sub.name}>
                            &nbsp;&nbsp;↳ {sub.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
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
                </select>
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
                            paginatedIncomes.length > 0 &&
                            paginatedIncomes.every((i) => selectedIds.includes(i.id))
                          }
                          className="w-4 h-4 rounded text-green-600 focus:ring-green-500 cursor-pointer"
                        />
                      </th>
                    )}
                    <th className="py-3.5 px-4 text-center w-12">ລຳດັບ</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">ເລກບິນ / ວັນທີ</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">ປະເພດລາຍຮັບ</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">ໝວດໝູ່</th>
                    <th className="py-3.5 px-4 min-w-[180px]">ເນື້ອໃນລາຍການ</th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap">ຄ່າທຳນຽມ (ມອບລັດ)</th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap">ຄ່າບໍລິການ (ວິຊາການ)</th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap">ຍອດລວມບິນ (ກີບ)</th>
                    {userRole !== "DIRECTOR" && <th className="py-3.5 px-4 text-center whitespace-nowrap">ຈັດການ</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {paginatedIncomes.length > 0 ? (
                    paginatedIncomes.map((item, index) => {
                      const isFeeService = item.incomeType === "FEE_SERVICE";
                      const catName = item.categoryName || item.category || "-";

                      return (
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
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <p className="font-bold text-slate-800">{item.referenceNo || "-"}</p>
                            <p className="text-[11px] text-slate-400">{item.date}</p>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {isFeeService ? (
                              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold">
                                🏛️ ຄ່າທຳນຽມ&ບໍລິການ
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold">
                                🟢 ບໍລິຫານ (ໃຊ້ໄດ້ເລີຍ)
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-800">
                            {catName}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900">{item.description}</td>
                          <td className="py-3.5 px-4 text-right font-bold text-blue-600 whitespace-nowrap">
                            {isFeeService ? Number(item.feeAmount || 0).toLocaleString() : "-"}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-purple-600 whitespace-nowrap">
                            {isFeeService ? Number(item.serviceAmount || 0).toLocaleString() : "-"}
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-slate-900 whitespace-nowrap">
                            {Number(item.amount || 0).toLocaleString()}
                          </td>
                          {userRole !== "DIRECTOR" && (
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <div className="flex justify-center items-center gap-1">
                                <button
                                  onClick={() => handleOpenEdit(item)}
                                  className="p-1.5 text-slate-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-all"
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

      {/* Modal ເພີ່ມ / ແກ້ໄຂ */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-800">
                {editingId ? "ແກ້ໄຂຂໍ້ມູນລາຍຮັບ" : "ເພີ່ມລາຍຮັບໃໝ່"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* 💡 ເລືອກປະເພດລາຍຮັບ */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <label className="font-bold text-slate-800 text-xs block">ເລືອກປະເພດລາຍຮັບ *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, incomeType: "REGULAR" })}
                    className={`p-2.5 rounded-xl font-bold border transition-all text-left ${
                      formData.incomeType === "REGULAR"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                        : "bg-white text-slate-600 border-slate-200"
                    }`}
                  >
                    🟢 ບໍລິຫານ (ໃຊ້ໄດ້ເລີຍ)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, incomeType: "FEE_SERVICE" })}
                    className={`p-2.5 rounded-xl font-bold border transition-all text-left ${
                      formData.incomeType === "FEE_SERVICE"
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : "bg-white text-slate-600 border-slate-200"
                    }`}
                  >
                    🏛️ ຄ່າທຳນຽມ & ຄ່າບໍລິການ
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700">ເລກບິນສັ່ງຈ່າຍ / Reference</label>
                  <input
                    type="text"
                    placeholder="INC-2026-001..."
                    value={formData.referenceNo}
                    onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                    className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">ວັນທີ *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">ໝວດໝູ່ລາຍຮັບ *</label>
                <select
                  value={formData.categoryName}
                  onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                  className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 font-semibold"
                  required
                >
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <optgroup key={cat.id} label={cat.name}>
                        <option value={cat.name}>{cat.name} (ໝວດຫຼັກ)</option>
                        {cat.children && cat.children.map((sub) => (
                          <option key={sub.id} value={sub.name}>
                            &nbsp;&nbsp;↳ {sub.name}
                          </option>
                        ))}
                      </optgroup>
                    ))
                  ) : (
                    <option value="ລາຍຮັບທົ່ວໄປ">ລາຍຮັບທົ່ວໄປ</option>
                  )}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700">ເນື້ອໃນລາຍການ *</label>
                <textarea
                  placeholder="ປ້ອນລາຍລະອຽດເນື້ອໃນ..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 h-20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700">ຜູ້ມອບເງິນ / ຜູ້ເບີກ</label>
                  <input
                    type="text"
                    placeholder="ຊື່ຜູ້ມອບ..."
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

              {/* 💡 ຊ່ອງປ້ອນຕົວເລກຕາມປະເພດລາຍຮັບ */}
              {formData.incomeType === "FEE_SERVICE" ? (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-3">
                  <p className="font-bold text-blue-900 text-xs">🏛️ ປ້ອນຍອດເງິນໃນ 1 ບິນ:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-blue-800 text-[11px]">1. ຄ່າທຳນຽມ (ມອບລັດ)</label>
                      <input
                        type="text"
                        placeholder="0"
                        value={formData.feeAmount}
                        onChange={(e) => setFormData({ ...formData, feeAmount: formatNumberInput(e.target.value) })}
                        className="w-full p-2.5 bg-white border border-blue-300 rounded-xl mt-1 text-sm font-bold text-blue-700"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-purple-800 text-[11px]">2. ຄ່າບໍລິການ (ວິຊາການ)</label>
                      <input
                        type="text"
                        placeholder="0"
                        value={formData.serviceAmount}
                        onChange={(e) => setFormData({ ...formData, serviceAmount: formatNumberInput(e.target.value) })}
                        className="w-full p-2.5 bg-white border border-purple-300 rounded-xl mt-1 text-sm font-bold text-purple-700"
                      />
                    </div>
                  </div>
                  <div className="pt-1 text-right text-xs font-black text-slate-800">
                    ຍອດລວມບິນ: {(parseFormattedNumber(formData.feeAmount) + parseFormattedNumber(formData.serviceAmount)).toLocaleString()} ກີບ
                  </div>
                </div>
              ) : (
                <div>
                  <label className="font-bold text-slate-700">ຈຳນວນເງິນບໍລິຫານ (ກີບ) *</label>
                  <input
                    type="text"
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: formatNumberInput(e.target.value) })}
                    className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm font-bold text-green-700 focus:outline-none focus:ring-2 focus:ring-green-600"
                    required
                  />
                </div>
              )}

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
    </div>
  );
}