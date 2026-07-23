"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Trash2, 
  Edit,
  X
} from "lucide-react";

interface UserItem {
  id: number;
  username: string;
  fullName: string;
  role: "ADMIN" | "DIRECTOR" | "FINANCE_STAFF" | "ASSET_STAFF";
  createdAt: string;
}

export default function SettingsPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    role: "FINANCE_STAFF" as UserItem["role"],
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Fetch Users Error:", err);
    }
  };

  // ເປີດ Modal ເພີ່ມໃໝ່
  const handleOpenAddModal = () => {
    setEditingUserId(null);
    setFormData({
      username: "",
      password: "",
      fullName: "",
      role: "FINANCE_STAFF",
    });
    setShowModal(true);
  };

  // ເປີດ Modal ແກ້ໄຂ
  const handleOpenEditModal = (user: UserItem) => {
    setEditingUserId(user.id);
    setFormData({
      username: user.username,
      password: "", // ປະໄວ້ວ່າງ ຖ້າບໍ່ປ່ຽນລະຫັດ
      fullName: user.fullName,
      role: user.role,
    });
    setShowModal(true);
  };

  // ບັນທຶກ (ເພີ່ມ/ແກ້ໄຂ)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.fullName) {
      alert("ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ!");
      return;
    }

    if (!editingUserId && !formData.password) {
      alert("ກະລຸນາປ້ອນລະຫັດຜ່ານສຳລັບຜູ້ໃຊ້ໃໝ່!");
      return;
    }

    try {
      const isEdit = editingUserId !== null;
      const url = isEdit ? `/api/users/${editingUserId}` : "/api/users";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        fetchUsers();
        setShowModal(false);
        alert(isEdit ? "ແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້ງານສຳເລັດ!" : "ເພີ່ມຜູ້ໃຊ້ງານໃໝ່ສຳເລັດ!");
      } else {
        alert(data.message || "ເກີດຂໍ້ຜິດພາດ!");
      }
    } catch (err) {
      alert("ບໍ່ສາມາດເຊື່ອມຕໍ່ Server ໄດ້!");
    }
  };

  const handleDelete = async (id: number, username: string) => {
    if (username === "admin") {
      alert("ບໍ່ສາມາດລົບ ບັນຊີ Admin ຫຼັກໄດ້!");
      return;
    }

    if (!confirm(`ທ່ານຕ້ອງການລົບຜູ້ໃຊ້ "${username}" ແທ້ຫຼືບໍ່?`)) return;

    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.message || "ລົບບໍ່ສຳເລັດ!");
      }
    } catch (err) {
      alert("ເກີດຂໍ້ຜິດພາດ!");
    }
  };

  const getRoleBadge = (role: UserItem["role"]) => {
    switch (role) {
      case "ADMIN":
        return <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold rounded-lg">Admin / ຜູ້ບໍລິຫານ</span>;
      case "DIRECTOR":
        return <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold rounded-lg">Director / ຫົວໜ້າກົມ</span>;
      case "FINANCE_STAFF":
        return <span className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-bold rounded-lg">Finance Staff / ພະນັກງານການເງິນ</span>;
      case "ASSET_STAFF":
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-lg">Asset Staff / ພະນັກງານຊັບສິນ</span>;
    }
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
          title="ການຕັ້ງຄ່າລະບົບ & ຈັດການຜູ້ໃຊ້ (Settings)" 
          userName="ຜູ້ບໍລິຫານລະບົບ" 
          userRole="ADMIN" 
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />

        <main className="p-6 space-y-6 w-full max-w-full overflow-hidden">
          {/* Header Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-green-50 text-green-600 rounded-2xl border border-green-100">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">ຈັດການຜູ້ໃຊ້ງານລະບົບ</h2>
                <p className="text-xs text-slate-500 mt-0.5">ເພີ່ມ, ແກ້ໄຂ, ລົບ ແລະ ກຳນົດສິດທິການເຂົ້າເຖິງຂໍ້ມູນຂອງພະນັກງານ</p>
              </div>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-green-600/20 transition-all w-full sm:w-auto"
            >
              <UserPlus className="w-4 h-4" />
              <span>ເພີ່ມຜູ້ໃຊ້ໃໝ່</span>
            </button>
          </div>

          {/* Table Users */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 w-full overflow-hidden space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                ລາຍຊື່ຜູ້ໃຊ້ງານທັງໝົດໃນ Database
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                ລວມ: {users.length} ບັນຊີ
              </span>
            </div>

            <div className="w-full overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-sm text-slate-600 border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-4 text-center w-16">ລຳດັບ</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">ຊື່ຜູ້ໃຊ້ (Username)</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">ຊື່ ແລະ ນາມສະກຸນ</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">ສິດທິການນຳໃຊ້ (Role)</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">ວັນທີສ້າງ</th>
                    <th className="py-3.5 px-4 text-center whitespace-nowrap">ຈັດການ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {users.length > 0 ? (
                    users.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 text-center font-bold text-slate-400">{index + 1}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">{item.username}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{item.fullName}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{getRoleBadge(item.role)}</td>
                        <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">
                          {new Date(item.createdAt).toLocaleDateString("la-LA")}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex justify-center items-center gap-1">
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all"
                              title="ແກ້ໄຂຂໍ້ມູນ"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {item.username !== "admin" ? (
                              <button
                                onClick={() => handleDelete(item.id, item.username)}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all"
                                title="ລົບຜູ້ໃຊ້"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modal ເພີ່ມ / ແກ້ໄຂ ຜູ້ໃຊ້ */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-800">
                {editingUserId ? "ແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້ງານ" : "ເພີ່ມຜູ້ໃຊ້ງານໃໝ່"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700">ຊື່ ແລະ ນາມສະກຸນ *</label>
                <input
                  type="text"
                  placeholder="ເຊັ່ນ: ທ່ານ ສົມຈິດ ພັນທະວົງ"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">ຊື່ຜູ້ໃຊ້ (Username) *</label>
                <input
                  type="text"
                  placeholder="ເຊັ່ນ: somchit"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">
                  {editingUserId ? "ລະຫັດຜ່ານໃໝ່ (ປະໄວ້ວ່າງ ຖ້າບໍ່ຕ້ອງການປ່ຽນ)" : "ລະຫັດຜ່ານ (Password) *"}
                </label>
                <input
                  type="password"
                  placeholder={editingUserId ? "•••••••• (ປະໄວ້ວ່າງຖ້າບໍ່ປ່ຽນ)" : "••••••••"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  required={!editingUserId}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">ສິດທິການນຳໃຊ້ (Role)</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserItem["role"] })}
                  className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 font-semibold"
                >
                  <option value="ADMIN">Admin (ເຫັນທຸກເມນູ)</option>
                  <option value="DIRECTOR">Director (ຫົວໜ້າກົມ - ເຫັນທຸກເມນູ)</option>
                  <option value="FINANCE_STAFF">Finance Staff (ພະນັກງານການເງິນ - ບໍ່ເຫັນຊັບສິນ)</option>
                  <option value="ASSET_STAFF">Asset Staff (ພະນັກງານຊັບສິນ - ບໍ່ເຫັນການເງິນ)</option>
                </select>
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
                  {editingUserId ? "ອັບເດດຂໍ້ມູນ" : "ບັນທຶກລົງ Database"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}