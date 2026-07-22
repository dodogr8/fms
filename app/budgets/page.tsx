"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { 
  Plus, 
  PieChart, 
  Search, 
  Wallet, 
  AlertTriangle, 
  Edit, 
  Trash2, 
  X,
  Percent,
  Coins,
  ArrowRightLeft
} from "lucide-react";

interface BudgetItem {
  id: number;
  projectName: string;
  categoryName: string;
  totalAmount: number;
  isDeduct: boolean;
  deductType: "percent" | "amount";
  deductValue: number;
  deductAmount: number;
  netAmount: number;
  usedAmount: number;
  startDate: string;
  endDate: string;
  detail: string;
}

export default function BudgetsPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    projectName: "",
    categoryName: "ງົບພັດທະນາ",
    totalAmount: "",
    isDeduct: false,
    deductType: "percent" as "percent" | "amount",
    deductValue: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "2026-12-31",
    detail: "",
  });

  // 💡 ດຶງຂໍ້ມູນງົບປະມານຈາກ DB ຈິງ
  useEffect(() => {
    fetchBudgets();
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

  // ຄຳນວນ Realtime ຢູ່ໜ້າຟອມ
  const total = parseFloat(formData.totalAmount) || 0;
  const val = parseFloat(formData.deductValue) || 0;
  let calculatedDeductAmount = 0;

  if (formData.isDeduct && total > 0) {
    if (formData.deductType === "percent") {
      calculatedDeductAmount = (total * val) / 100;
    } else {
      calculatedDeductAmount = val;
    }
  }
  const calculatedNetAmount = total - calculatedDeductAmount;

  // 💡 ບັນທຶກລົງ Database ຈິງ
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectName || !formData.totalAmount) {
      alert("ກະລຸນາປ້ອນຊື່ໂຄງການ ແລະ ຈຳນວນງົບປະມານ!");
      return;
    }

    try {
      const payload = {
        ...formData,
        deductAmount: calculatedDeductAmount,
        netAmount: calculatedNetAmount,
      };

      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchBudgets();
        if (formData.isDeduct && calculatedDeductAmount > 0) {
          alert(
            `ບັນທຶກໂຄງການສຳເລັດ! ລະບົບໄດ້ໂອນຍອດຫັກບໍລິຫານຈຳນວນ ${calculatedDeductAmount.toLocaleString()} ກີບ ເຂົ້າເປັນ "ລາຍຮັບ (Income)" ໃນ Database ຮຽບຮ້ອຍແລ້ວ.`
          );
        }
        setShowAddModal(false);
        setFormData({
          projectName: "",
          categoryName: "ງົບພັດທະນາ",
          totalAmount: "",
          isDeduct: false,
          deductType: "percent",
          deductValue: "",
          startDate: new Date().toISOString().split("T")[0],
          endDate: "2026-12-31",
          detail: "",
        });
      } else {
        alert("ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ!");
      }
    } catch (err) {
      alert("ບໍ່ສາມາດເຊື່ອມຕໍ່ Server ໄດ້!");
    }
  };

  const totalBudgetSum = budgets.reduce((sum, item) => sum + Number(item.totalAmount), 0);
  const totalDeductSum = budgets.reduce((sum, item) => sum + Number(item.deductAmount), 0);
  const totalUsedSum = budgets.reduce((sum, item) => sum + Number(item.usedAmount), 0);

  const filteredBudgets = budgets.filter(
    (item) =>
      item.projectName && item.projectName.toLowerCase().includes(searchTerm.toLowerCase())
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
          title="ຄຸ້ມຄອງງົບປະມານໂຄງການ (Budgets)" 
          userName="ຜູ້ບໍລິຫານລະບົບ" 
          userRole="ADMIN" 
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />

        <main className="p-6 space-y-6 w-full max-w-full overflow-hidden">
          {/* Header Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">ງົບປະມານໂຄງການລວມ</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{totalBudgetSum.toLocaleString()} ກີບ</h3>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Wallet className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">ຍອດຫັກບໍລິຫານ (ເຂົ້າລາຍຮັບ)</p>
                <h3 className="text-2xl font-black text-green-700 mt-1">+{totalDeductSum.toLocaleString()} ກີບ</h3>
              </div>
              <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">ໃຊ້ໄປແລ້ວລວມ</p>
                <h3 className="text-2xl font-black text-red-600 mt-1">{totalUsedSum.toLocaleString()} ກີບ</h3>
              </div>
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                <PieChart className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Search & Add */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ຄົ້ນຫາຕາມຊື່ໂຄງສ້າງ/ງົບປະມານ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                />
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-green-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>ເພີ່ມໂຄງການໃໝ່</span>
              </button>
            </div>

            {/* Budget List Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
              {filteredBudgets.length > 0 ? (
                filteredBudgets.map((item) => {
                  const net = Number(item.netAmount);
                  const used = Number(item.usedAmount);
                  const remain = net - used;
                  const percent = net > 0 ? Math.round((used / net) * 100) : 0;

                  let progressColor = "bg-green-500";
                  if (percent >= 80 && percent < 95) progressColor = "bg-amber-500";
                  if (percent >= 95) progressColor = "bg-red-500";

                  return (
                    <div key={item.id} className="bg-slate-50/70 rounded-2xl border border-slate-200 p-5 space-y-4 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-lg border border-green-200">
                            {item.categoryName}
                          </span>
                          <h4 className="font-bold text-slate-900 text-base mt-2 line-clamp-1">{item.projectName}</h4>
                        </div>
                        <div className="flex items-center gap-1">
                          <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-white">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs font-semibold pt-2 border-t border-slate-200/60">
                        <div className="flex justify-between text-slate-600">
                          <span>ງົບໂຄງການທັງໝົດ:</span>
                          <span className="font-bold text-slate-900">{Number(item.totalAmount).toLocaleString()} ກີບ</span>
                        </div>

                        {item.isDeduct && (
                          <div className="flex justify-between text-green-700 bg-green-50/80 p-2 rounded-lg border border-green-100">
                            <span>
                              ຫັກບໍລິຫານ ({item.deductType === "percent" ? `${item.deductValue}%` : "ເງິນສົດ"}):
                            </span>
                            <span className="font-bold">+{Number(item.deductAmount).toLocaleString()} ກີບ</span>
                          </div>
                        )}

                        <div className="flex justify-between text-slate-600">
                          <span>ງົບສຸດທິໃຊ້ໃນໂຄງການ:</span>
                          <span className="font-bold text-slate-800">{net.toLocaleString()} ກີບ</span>
                        </div>

                        <div className="flex justify-between text-slate-600">
                          <span>ໃຊ້ໄປແລ້ວ:</span>
                          <span className="font-bold text-red-600">-{used.toLocaleString()} ກີບ</span>
                        </div>

                        <div className="flex justify-between text-slate-900 text-sm font-bold pt-1 border-t border-slate-200/40">
                          <span>ຍອດເຫຼືອໃຊ້ໄດ້:</span>
                          <span className="text-green-700">{remain.toLocaleString()} ກີບ</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-slate-500">
                          <span>ຄວາມຄືບໜ້າການໃຊ້ງົບ</span>
                          <span className={percent >= 90 ? "text-red-600" : "text-slate-700"}>{percent}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${progressColor} transition-all duration-500 rounded-full`} 
                            style={{ width: `${percent > 100 ? 100 : percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12 text-slate-400 font-medium">
                  ບໍ່ພົບຂໍ້ມູນງົບປະມານໃນ Database
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal ເພີ່ມໂຄງການໃໝ່ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-800">ເພີ່ມໂຄງການ / ງົບປະມານໃໝ່</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700">ຊື່ໂຄງການ / ງົບປະມານ *</label>
                <input
                  type="text"
                  placeholder="ເຊັ່ນ: ໂຄງການສຳຫຼວດພັດທະນາ..."
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700">ໝວດໝູ່ / ແຫຼ່ງທຶນ</label>
                  <select
                    value={formData.categoryName}
                    onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                    className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  >
                    <option value="ງົບພັດທະນາ">ງົບພັດທະນາ</option>
                    <option value="ງົບປະມານບໍລິຫານ">ງົບປະມານບໍລິຫານ</option>
                    <option value="ງົບສ້ອມແປງ">ງົບສ້ອມແປງ</option>
                    <option value="ງົບຊ່ວຍເຫຼືອລັດ">ງົບຊ່ວຍເຫຼືອລັດ</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700">ງົບປະມານທັງໝົດ (ກີບ) *</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                    className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-600"
                    required
                  />
                </div>
              </div>

              {/* 💡 ສ່ວນຕັ້ງຄ່າການຫັກເງິນບໍລິຫານ */}
              <div className="p-4 bg-green-50/60 rounded-2xl border border-green-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-green-900 text-sm flex items-center gap-2">
                    <Coins className="w-4 h-4 text-green-600" />
                    ຫັກເງິນບໍລິຫານເຂົ້າເປັນລາຍຮັບ?
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isDeduct}
                      onChange={(e) => setFormData({ ...formData, isDeduct: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                {formData.isDeduct && (
                  <div className="space-y-3 pt-2 border-t border-green-200/60">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, deductType: "percent" })}
                        className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                          formData.deductType === "percent"
                            ? "bg-green-600 text-white shadow-sm"
                            : "bg-white text-slate-600 border border-slate-200"
                        }`}
                      >
                        <Percent className="w-3.5 h-3.5" />
                        <span>ຫັກເປັນເປີເຊັນ (%)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, deductType: "amount" })}
                        className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                          formData.deductType === "amount"
                            ? "bg-green-600 text-white shadow-sm"
                            : "bg-white text-slate-600 border border-slate-200"
                        }`}
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>ຫັກເປັນເງິນກີບ</span>
                      </button>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700">
                        {formData.deductType === "percent" ? "ປ້ອນເປີເຊັນທີ່ຈະຫັກ (%)" : "ປ້ອນຈຳນວນເງິນທີ່ຈະຫັກ (ກີບ)"}
                      </label>
                      <input
                        type="number"
                        placeholder={formData.deductType === "percent" ? "ເຊັ່ນ: 10" : "ເຊັ່ນ: 5000000"}
                        value={formData.deductValue}
                        onChange={(e) => setFormData({ ...formData, deductValue: e.target.value })}
                        className="w-full p-2.5 bg-white border border-green-300 rounded-xl mt-1 text-sm font-bold text-green-800 focus:outline-none focus:ring-2 focus:ring-green-600"
                      />
                    </div>

                    {total > 0 && (
                      <div className="p-3 bg-white rounded-xl border border-green-200 space-y-1 text-[11px]">
                        <div className="flex justify-between text-slate-600">
                          <span>ຍອດຫັກເຂົ້າລາຍຮັບ:</span>
                          <strong className="text-green-700 font-extrabold">
                            +{calculatedDeductAmount.toLocaleString()} ກີບ
                          </strong>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>ງົບເຫຼືອໃຊ້ໃນໂຄງການ:</span>
                          <strong className="text-slate-800 font-extrabold">
                            {calculatedNetAmount.toLocaleString()} ກີບ
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700">ວັນທີເລີ່ມຕົ້ນ</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">ວັນທີສິ້ນສຸດ</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">ລາຍລະອຽດໂຄງການ</label>
                <textarea
                  placeholder="ອະທິບາຍລາຍລະອຽດ..."
                  value={formData.detail}
                  onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                  className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 h-16"
                />
              </div>

              <div className="pt-2 flex gap-3">
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
    </div>
  );
}