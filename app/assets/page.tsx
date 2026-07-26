"use client";

import { useState, useEffect, useMemo } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { formatNumberInput, parseFormattedNumber } from "../../lib/formatters";
import { showSuccess, showError, showConfirm } from "../../lib/swal";
import { 
  Plus, 
  Search, 
  Package, 
  QrCode, 
  Edit, 
  Trash2, 
  X,
  User,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Upload,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react";


interface AssetItem {
  id: number;
  assetCode: string;
  name: string;
  categoryName: string;
  purchaseDate: string;
  price: number;
  assignedTo: string;
  status: "available" | "in_use" | "maintenance" | "broken";
  attachment?: string;
}

interface CategoryItem {
  id: number;
  name: string;
  type: string;
  children: { id: number; name: string }[];
}

export default function AssetsPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]); // 💡 State ເກັບໝວດໝູ່ຊັບສິນຈາກ Database
  const [userRole, setUserRole] = useState<"ADMIN" | "DIRECTOR" | "FINANCE_STAFF" | "ASSET_STAFF">("ADMIN");

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCode, setFilterCode] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterAssigned, setFilterAssigned] = useState("");

  // Checkbox & Bulk Selection
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Pagination
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedQR, setSelectedQR] = useState<AssetItem | null>(null);

  const [formData, setFormData] = useState({
    assetCode: "",
    name: "",
    categoryName: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    price: "",
    assignedTo: "",
    status: "available" as AssetItem["status"],
    attachment: "",
  });

  useEffect(() => {
    fetchAssets();
    fetchCategories(); // 💡 ດຶງໝວດໝູ່ຊັບສິນຈາກ Database

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

  const fetchAssets = async () => {
    try {
      const res = await fetch("/api/assets");
      if (res.ok) {
        const data = await res.json();
        setAssets(data);
      }
    } catch (err) {
      showError("Fetch Assets Error: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  // 💡 ດຶງໝວດໝູ່ຊັບສິນຈາກ /api/categories?type=ASSET
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories?type=ASSET");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Fetch Categories Error:", err);
    }
  };

  // Realtime Filter Logic
  const filteredAssets = useMemo(() => {
    return assets.filter((item) => {
      const matchSearch =
        (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.assetCode && item.assetCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.categoryName && item.categoryName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.assignedTo && item.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCode = filterCode ? item.assetCode?.toLowerCase().includes(filterCode.toLowerCase()) : true;
      const matchCategory = filterCategory ? item.categoryName?.toLowerCase().includes(filterCategory.toLowerCase()) : true;
      const matchAssigned = filterAssigned ? item.assignedTo?.toLowerCase().includes(filterAssigned.toLowerCase()) : true;

      return matchSearch && matchCode && matchCategory && matchAssigned;
    });
  }, [assets, searchTerm, filterCode, filterCategory, filterAssigned]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredAssets.length / pageSize) || 1;
  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAssets.slice(start, start + pageSize);
  }, [filteredAssets, currentPage, pageSize]);

  // Select All Logic
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedAssets.map((i) => i.id));
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, attachment: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      assetCode: "",
      name: "",
      categoryName: categories.length > 0 ? categories[0].name : "",
      purchaseDate: new Date().toISOString().split("T")[0],
      price: "",
      assignedTo: "",
      status: "available",
      attachment: "",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: AssetItem) => {
    setEditingId(item.id);
    setFormData({
      assetCode: item.assetCode || "",
      name: item.name || "",
      categoryName: item.categoryName || "",
      purchaseDate: item.purchaseDate || new Date().toISOString().split("T")[0],
      price: formatNumberInput(item.price.toString()),
      assignedTo: item.assignedTo || "",
      status: item.status || "available",
      attachment: item.attachment || "",
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert("ກະລຸນາປ້ອນຊື່ຊັບສິນ ແລະ ມູນຄ່າ!");
      return;
    }

    try {
      const isEdit = editingId !== null;
      const url = isEdit ? `/api/assets/${editingId}` : "/api/assets";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        ...formData,
        price: parseFormattedNumber(formData.price),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchAssets();
        setShowModal(false);
        alert(isEdit ? "ແກ້ໄຂຂໍ້ມູນສຳເລັດ!" : "ບັນທຶກຂໍ້ມູນສຳເລັດ!");
      } else {
        alert("ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ! ລະຫັດຊັບສິນອາດຈະຊ້ຳກັນ.");
      }
    } catch (err) {
      alert("ບໍ່ສາມາດເຊື່ອມຕໍ່ Server ໄດ້!");
    }
  };

  const handleDeleteOne = async (id: number) => {
    if (!confirm("ທ່ານຕ້ອງການລົບຊັບສິນນີ້ແທ້ຫຼືບໍ່?")) return;
    try {
      const res = await fetch(`/api/assets/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchAssets();
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
    if (!confirm(`ທ່ານຕ້ອງການລົບ ${selectedIds.length} ຊັບສິນທີ່ເລືອກແທ້ຫຼືບໍ່?`)) return;

    try {
      const res = await fetch("/api/assets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (res.ok) {
        fetchAssets();
        setSelectedIds([]);
        alert("ລົບລາຍການທີ່ເລືອກສຳເລັດ!");
      } else {
        alert("ລົບຂໍ້ມູນບໍ່ສຳເລັດ!");
      }
    } catch (err) {
      alert("ເກີດຂໍ້ຜິດພາດ!");
    }
  };

  const getStatusBadge = (status: AssetItem["status"]) => {
    switch (status) {
      case "available":
        return <span className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-bold rounded-lg flex items-center gap-1 w-fit"><CheckCircle2 className="w-3.5 h-3.5" /> ວ່າງ / ພ້ອມໃຊ້</span>;
      case "in_use":
        return <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold rounded-lg flex items-center gap-1 w-fit"><User className="w-3.5 h-3.5" /> ກຳລັງນຳໃຊ້</span>;
      case "maintenance":
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-lg flex items-center gap-1 w-fit"><Wrench className="w-3.5 h-3.5" /> ກຳລັງສ້ອມແປງ</span>;
      case "broken":
        return <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 text-xs font-bold rounded-lg flex items-center gap-1 w-fit"><AlertTriangle className="w-3.5 h-3.5" /> ເປ່ເພ / ທຳລາຍ</span>;
    }
  };

  const totalAssetValue = assets.reduce((sum, item) => sum + Number(item.price), 0);

  return (
    <div className="flex w-full min-h-screen bg-slate-50 overflow-x-hidden">
      <Sidebar userRole={userRole} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Navbar 
          title="ຄຸ້ມຄອງຊັບສິນ (Assets)" 
          userName="ຜູ້ໃຊ້ງານລະບົບ" 
          userRole={userRole} 
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />

        <main className="p-6 space-y-6 w-full max-w-full overflow-hidden">
          {/* Header Card Summary */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-green-50 text-green-600 rounded-2xl border border-green-100">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">ມູນຄ່າຊັບສິນລວມທັງໝົດ</p>
                <h2 className="text-3xl font-black text-slate-900">{totalAssetValue.toLocaleString()} ກີບ</h2>
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
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-green-600/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>ເພີ່ມຊັບສິນໃໝ່</span>
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
                  placeholder="ຄົ້ນຫາ Realtime (ລະຫັດ, ຊື່, ຜູ້ຮັບຜິດຊອບ)..."
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
                  placeholder="ກັ່ນຕອງ ລະຫັດ..."
                  value={filterCode}
                  onChange={(e) => setFilterCode(e.target.value)}
                  className="w-full p-2 bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="ກັ່ນຕອງ ໝວດໝູ່..."
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full p-2 bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="ກັ່ນຕອງ ຜູ້ຮັບຜິດຊອບ..."
                  value={filterAssigned}
                  onChange={(e) => setFilterAssigned(e.target.value)}
                  className="w-full p-2 bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600"
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
                            paginatedAssets.length > 0 &&
                            paginatedAssets.every((i) => selectedIds.includes(i.id))
                          }
                          className="w-4 h-4 rounded text-green-600 focus:ring-green-500 cursor-pointer"
                        />
                      </th>
                    )}
                    <th className="py-3.5 px-4 text-center w-12">ລຳດັບ</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">ລະຫັດຊັບສິນ</th>
                    <th className="py-3.5 px-4 min-w-[180px]">ຊື່ຊັບສິນ</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">ໝວດໝູ່</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">ມູນຄ່າ (ກີບ)</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">ຜູ້ຮັບຜິດຊອບ</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">ສະຖານະ</th>
                    <th className="py-3.5 px-4 text-center whitespace-nowrap">ເອກະສານ/ຮູບ</th>
                    <th className="py-3.5 px-4 text-center whitespace-nowrap">QR Code</th>
                    {userRole !== "DIRECTOR" && <th className="py-3.5 px-4 text-center whitespace-nowrap">ຈັດການ</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {paginatedAssets.length > 0 ? (
                    paginatedAssets.map((item, index) => (
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
                        <td className="py-3.5 px-4 font-semibold text-green-700 whitespace-nowrap">{item.assetCode}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{item.name}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{item.categoryName || "-"}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">{Number(item.price).toLocaleString()}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{item.assignedTo || "-"}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {item.attachment ? (
                            <a 
                              href={item.attachment} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-100"
                              title="ເບິ່ງໄຟລ໌ແນບ"
                            >
                              <FileText className="w-3.5 h-3.5" /> ເບິ່ງໄຟລ໌
                            </a>
                          ) : (
                            <span className="text-slate-400 text-xs">ບໍ່ມີໄຟລ໌</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => setSelectedQR(item)}
                            className="p-1.5 bg-slate-100 hover:bg-green-50 text-slate-600 hover:text-green-700 rounded-lg transition-all"
                            title="ເບິ່ງ QR Code"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                        </td>

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
                      <td colSpan={userRole !== "DIRECTOR" ? 11 : 9} className="py-12 text-center text-slate-400">
                        ບໍ່ພົບຂໍ້ມູນຊັບສິນໃນ Database
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
              <span>
                ສະແດງ {(currentPage - 1) * pageSize + 1} ຫາ {Math.min(currentPage * pageSize, filteredAssets.length)} ຈາກທັງໝົດ {filteredAssets.length} ລາຍການ
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

      {/* Modal ເພີ່ມ / ແກ້ໄຂ ຊັບສິນ */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-800">
                {editingId ? "ແກ້ໄຂຂໍ້ມູນຊັບສິນ" : "ເພີ່ມຂໍ້ມູນຊັບສິນໃໝ່"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700">ລະຫັດຊັບສິນ</label>
                  <input
                    type="text"
                    placeholder="COM-2026-001"
                    value={formData.assetCode}
                    onChange={(e) => setFormData({ ...formData, assetCode: e.target.value })}
                    className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
                
                {/* 💡 ຊ່ອງເລືອກໝວດໝູ່ຊັບສິນແບບ Dynamic ຈາກ Database */}
                <div>
                  <label className="font-bold text-slate-700">ໝວດໝູ່ *</label>
                  <select
                    value={formData.categoryName}
                    onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                    className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 font-semibold"
                  >
                    <option value="">-- ເລືອກໝວດໝູ່ --</option>
                    {categories.map((cat) => (
                      <optgroup key={cat.id} label={cat.name}>
                        <option value={cat.name}>{cat.name} (ໝວດຫຼັກ)</option>
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

              <div>
                <label className="font-bold text-slate-700">ຊື່ຊັບສິນ *</label>
                <input
                  type="text"
                  placeholder="ປ້ອນຊື່ຊັບສິນ..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700">ມູນຄ່າຊື້ (ກີບ) *</label>
                  <input
                    type="text"
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => {
                      const formatted = formatNumberInput(e.target.value);
                      setFormData({ ...formData, price: formatted });
                    }}
                    className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-600"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">ວັນທີຈັດຊື້</label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700">ຜູ້ຮັບຜິດຊອບ / ບ່ອນຕັ້ງ</label>
                  <input
                    type="text"
                    placeholder="ຊື່ພະນັກງານ ຫຼື ຫ້ອງການ..."
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">ສະຖານະ</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as AssetItem["status"] })}
                    className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  >
                    <option value="available">ວ່າງ / ພ້ອມໃຊ້</option>
                    <option value="in_use">ກຳລັງນຳໃຊ້</option>
                    <option value="maintenance">ກຳລັງສ້ອມແປງ</option>
                    <option value="broken">ເປ່ເພ / ທຳລາຍ</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2">
                <label className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  ອັບໂຫລດຮູບພາບຊັບສິນ ຫຼື ໃບບິນ/ເອກະສານ (ທາງເລືອກ)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                />
                {formData.attachment && (
                  <p className="text-[11px] text-emerald-700 font-bold">✅ ແນບໄຟລ໌ສຳເລັດແລ້ວ</p>
                )}
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
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/20"
                >
                  {editingId ? "ອັບເດດຂໍ້ມູນ" : "ບັນທຶກລົງ Database"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal QR Code */}
      {selectedQR && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center space-y-4 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-bold text-slate-800 text-sm">QR Code ຊັບສິນ</h4>
              <button onClick={() => setSelectedQR(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl flex justify-center border border-slate-100">
              <QrCode values={`https://gfms.gov.la/view_asset?code=${selectedQR.assetCode}`} size={160} />
            </div>

            <div>
              <p className="font-black text-green-700 text-base">{selectedQR.assetCode}</p>
              <p className="text-xs text-slate-600 font-bold mt-1">{selectedQR.name}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{selectedQR.assignedTo}</p>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs"
            >
              ພິມ QR Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
}