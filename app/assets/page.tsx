"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
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
  Image as ImageIcon,
  Upload
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

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

export default function AssetsPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedQR, setSelectedQR] = useState<AssetItem | null>(null);

  const [formData, setFormData] = useState({
    assetCode: "",
    name: "",
    categoryName: "ອຸປະກອນ IT",
    purchaseDate: new Date().toISOString().split("T")[0],
    price: "",
    assignedTo: "",
    status: "available" as AssetItem["status"],
    attachment: "",
  });

  // ດຶງຂໍ້ມູນຊັບສິນຈາກ Database
  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const res = await fetch("/api/assets");
      if (res.ok) {
        const data = await res.json();
        setAssets(data);
      }
    } catch (err) {
      console.error("Fetch Assets Error:", err);
    }
  };

  // ຈັດການອັບໂຫລດໄຟລ໌ (แปลงເປັນ Base64 ຊົ່ວຄາວເພື່ອເກັບລົງ DB)
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

  // ບັນທຶກຊັບສິນລົງ Database
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert("ກະລຸນາປ້ອນຊື່ຊັບສິນ ແລະ ມູນຄ່າ!");
      return;
    }

    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchAssets();
        setShowAddModal(false);
        setFormData({
          assetCode: "",
          name: "",
          categoryName: "ອຸປະກອນ IT",
          purchaseDate: new Date().toISOString().split("T")[0],
          price: "",
          assignedTo: "",
          status: "available",
          attachment: "",
        });
      } else {
        alert("ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ! ລະຫັດຊັບສິນອາດຈະຊ້ຳກັນ.");
      }
    } catch (err) {
      alert("ບໍ່ສາມາດເຊື່ອມຕໍ່ Server ໄດ້!");
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

  const filteredAssets = assets.filter(
    (item) =>
      (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.assetCode && item.assetCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.assignedTo && item.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()))
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
          title="ຄຸ້ມຄອງຊັບສິນ (Assets)" 
          userName="ຜູ້ບໍລິຫານລະບົບ" 
          userRole="ADMIN" 
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />

        <main className="p-6 space-y-6 w-full max-w-full overflow-hidden">
          {/* Header Summary */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-green-50 text-green-600 rounded-2xl border border-green-100">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">ມູນຄ່າຊັບສິນລວມທັງໝົດ</p>
                <h2 className="text-3xl font-black text-slate-900">
                  {assets.reduce((sum, item) => sum + Number(item.price), 0).toLocaleString()} ກີບ
                </h2>
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-green-600/20 transition-all w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>ເພີ່ມຊັບສິນໃໝ່</span>
            </button>
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-4 p-5 w-full overflow-hidden">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ຄົ້ນຫາຕາມ ລະຫັດ, ຊື່ຊັບສິນ ຫຼື ຜູ້ຮັບຜິດຊອບ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                />
              </div>

              <span className="text-xs font-medium text-slate-500">
                ທັງໝົດ: <strong className="text-slate-800">{filteredAssets.length}</strong> ລາຍການ
              </span>
            </div>

            <div className="w-full overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-sm text-slate-600 border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-4 text-center w-16">ລຳດັບ</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">ລະຫັດຊັບສິນ</th>
                    <th className="py-3.5 px-4 min-w-[200px]">ຊື່ຊັບສິນ</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">ໝວດໝູ່</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">ມູນຄ່າ (ກີບ)</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">ຜູ້ຮັບຜິດຊອບ</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">ສະຖານະ</th>
                    <th className="py-3.5 px-4 text-center whitespace-nowrap">ເອກະສານ/ຮູບ</th>
                    <th className="py-3.5 px-4 text-center whitespace-nowrap">QR Code</th>
                    <th className="py-3.5 px-4 text-center whitespace-nowrap">ຈັດການ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredAssets.length > 0 ? (
                    filteredAssets.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 text-center font-bold text-slate-400">{index + 1}</td>
                        <td className="py-3.5 px-4 font-semibold text-green-700 whitespace-nowrap">{item.assetCode}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{item.name}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{item.categoryName}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">{Number(item.price).toLocaleString()}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{item.assignedTo}</td>
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
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        ບໍ່ພົບຂໍ້ມູນຊັບສິນໃນ Database
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modal ເພີ່ມຊັບສິນໃໝ່ (ພ້ອມອັບໂຫລດໄຟລ໌) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-800">ເພີ່ມຂໍ້ມູນຊັບສິນໃໝ່</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
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
                <div>
                  <label className="font-bold text-slate-700">ໝວດໝູ່</label>
                  <select
                    value={formData.categoryName}
                    onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                    className="w-full p-3 bg-slate-50 border rounded-xl mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  >
                    <option value="ອຸປະກອນ IT">ອຸປະກອນ IT</option>
                    <option value="ເຄື່ອງເຟີນີເຈີ">ເຄື່ອງເຟີນີເຈີ</option>
                    <option value="ພາຫະນະ">ພາຫະນະ</option>
                    <option value="ເຄື່ອງໃຊ້ຫ້ອງການ">ເຄື່ອງໃຊ້ຫ້ອງການ</option>
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
                    type="number"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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

              {/* 💡 ສ່ວນອັບໂຫລດຮູບພາບ ຫຼື ເອກະສານ */}
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
                  <p className="text-[11px] text-emerald-700 font-bold">✅ แนບໄຟລ໌ສຳເລັດແລ້ວ</p>
                )}
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
              <QRCodeSVG value={`https://gfms.gov.la/view_asset?code=${selectedQR.assetCode}`} size={160} />
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