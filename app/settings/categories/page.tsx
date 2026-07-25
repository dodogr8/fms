"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { showSuccess, showError, showConfirm } from "@/lib/swal";
import { 
  Plus, 
  FolderTree, 
  FolderPlus, 
  Edit, 
  Trash2, 
  X, 
  ChevronRight,
  Tags
} from "lucide-react";

interface SubCategory {
  id: number;
  name: string;
  type: string;
  parentId: number;
}

interface CategoryItem {
  id: number;
  name: string;
  type: "INCOME" | "EXPENSE" | "BUDGET" | "ASSET";
  parentId: number | null;
  children: SubCategory[];
}

export default function CategoriesSettingsPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"EXPENSE" | "INCOME" | "BUDGET" | "ASSET">("EXPENSE");
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [userRole, setUserRole] = useState<"ADMIN" | "DIRECTOR" | "FINANCE_STAFF" | "ASSET_STAFF">("ADMIN");

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalParentId, setModalParentId] = useState<number | null>(null);
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
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
  }, [activeTab]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`/api/categories?type=${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Fetch Categories Error:", err);
    }
  };

  const handleOpenAddMain = () => {
    setEditingId(null);
    setModalParentId(null);
    setCategoryName("");
    setShowModal(true);
  };

  const handleOpenAddSub = (parentId: number) => {
    setEditingId(null);
    setModalParentId(parentId);
    setCategoryName("");
    setShowModal(true);
  };

  const handleOpenEdit = (id: number, currentName: string) => {
    setEditingId(id);
    setModalParentId(null);
    setCategoryName(currentName);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      showError("ກະລຸນາປ້ອນຊື່ໝວດໝູ່!");
      return;
    }

    try {
      if (editingId) {
        const res = await fetch(`/api/categories/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: categoryName }),
        });
        if (res.ok) showSuccess("ອັບເດດໝວດໝູ່ສຳເລັດ!");
      } else {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: categoryName,
            type: activeTab,
            parentId: modalParentId,
          }),
        });
        if (res.ok) showSuccess("ເພີ່ມໝວດໝູ່ສຳເລັດ!");
      }

      fetchCategories();
      setShowModal(false);
    } catch (err) {
      showError("ເກີດຂໍ້ຜິດພາດ!");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`ທ່ານຕ້ອງການລົບໝວດໝູ່ "${name}" ແທ້ຫຼືບໍ່? (ຖ້າລົບໝວດຫຼັກ ໝວດຍ່ອຍຈະຖືກລົບນຳ)`)) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCategories();
        showSuccess("ລົບໝວດໝູ່ສຳເລັດ!");
      } else {
        showError("ບໍ່ສາມາດລົບໄດ້!");
      }
    } catch (err) {
      showError("ເກີດຂໍ້ຜິດພາດ!");
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-slate-50 overflow-x-hidden">
      <Sidebar userRole={userRole} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Navbar 
          title="ການຈັດການໝວດໝູ່" 
          userName="ຜູ້ໃຊ້ງານລະບົບ" 
          userRole={userRole} 
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />

        <main className="p-6 space-y-6 w-full max-w-full overflow-hidden">
          {/* Header Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                <FolderTree className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Categories Management</h2>
                <p className="text-xs text-slate-500 mt-0.5">ເພີ່ມ ຫຼື ແກ້ໄຂ ໝວດໝູ່ໃນລະບົບ</p>
              </div>
            </div>

            {userRole === "ADMIN" && (
              <button
                onClick={handleOpenAddMain}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>ເພີ່ມໝວດໝູ່ຫຼັກ</span>
              </button>
            )}
          </div>

          {/* Type Tabs */}
          <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("EXPENSE")}
              className={`px-5 py-3 text-xs font-bold rounded-t-2xl border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "EXPENSE"
                  ? "border-red-600 text-red-600 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Tags className="w-4 h-4" />
              ໝວດລາຍຈ່າຍ
            </button>
            <button
              onClick={() => setActiveTab("INCOME")}
              className={`px-5 py-3 text-xs font-bold rounded-t-2xl border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "INCOME"
                  ? "border-green-600 text-green-600 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Tags className="w-4 h-4" />
              ໝວດລາຍຮັບ
            </button>
            {/* 💡 ເພີ່ມ Tab ໝວດໝູ່ງົບປະມານ */}
            <button
              onClick={() => setActiveTab("BUDGET")}
              className={`px-5 py-3 text-xs font-bold rounded-t-2xl border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "BUDGET"
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Tags className="w-4 h-4" />
              ໝວດງົບປະມານ
            </button>
            <button
              onClick={() => setActiveTab("ASSET")}
              className={`px-5 py-3 text-xs font-bold rounded-t-2xl border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "ASSET"
                  ? "border-emerald-600 text-emerald-600 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Tags className="w-4 h-4" />
              ໝວດຊັບສິນ
            </button>
          </div>

          {/* Categories Tree List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            {categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <div key={cat.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold">
                          📌
                        </span>
                        <h4 className="font-bold text-slate-800 text-sm">{cat.name}</h4>
                      </div>

                      {userRole === "ADMIN" && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenAddSub(cat.id)}
                            className="p-1.5 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg font-bold flex items-center gap-1"
                            title="ເພີ່ມໝວດຍ່ອຍ"
                          >
                            <FolderPlus className="w-3.5 h-3.5" /> + ຍ່ອຍ
                          </button>
                          <button
                            onClick={() => handleOpenEdit(cat.id, cat.name)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                            title="ແກ້ໄຂ"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id, cat.name)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                            title="ລົບ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="pl-3 space-y-1.5">
                      {cat.children && cat.children.length > 0 ? (
                        cat.children.map((sub) => (
                          <div key={sub.id} className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100 text-xs">
                            <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                              {sub.name}
                            </span>
                            {userRole === "ADMIN" && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenEdit(sub.id, sub.name)}
                                  className="p-1 text-slate-400 hover:text-blue-600"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDelete(sub.id, sub.name)}
                                  className="p-1 text-slate-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-slate-400 italic pl-5">ຍັງບໍ່ມີໝວດໝູ່ຍ່ອຍ</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-sm">
                ຍັງບໍ່ມີໝວດໝູ່ໃນປະເພດນີ້
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingId 
                  ? "ແກ້ໄຂໝວດໝູ່" 
                  : modalParentId 
                  ? "ເພີ່ມໝວດໝູ່ຍ່ອຍ" 
                  : "ເພີ່ມໝວດໝູ່ຫຼັກ"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700">ຊື່ໝວດໝູ່ *</label>
                <input
                  type="text"
                  placeholder="ປ້ອນຊື່ໝວດໝູ່..."
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  ຍົກເລີກ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20"
                >
                  ບັນທຶກ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}