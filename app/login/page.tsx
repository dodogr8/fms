"use client";

import { useState } from "react";
import { Lock, User, Building2, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!username || !password) {
      setError("ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້ ແລະ ລະຫັດຜ່ານ!");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານ ບໍ່ຖືກຕ້ອງ!");
        setLoading(false);
        return;
      }

      // ເກັບຂໍ້ມູນ User ໄວ້ໃນ LocalStorage ເບື້ອງຕົ້ນ
      localStorage.setItem("user", JSON.stringify(data.user));

      // ປ່ຽນໜ້າໄປ Dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      setError("ບໍ່ສາມາດເຊື່ອມຕໍ່ Server ໄດ້! ກະລຸນາລອງໃໝ່.");
      setLoading(false);
    }
  };

  return (
    // ພື້ນຫຼັງສີເທົາອ່ອນ (Light Theme)
    <div className="min-h-screen w-full flex bg-slate-50">
      
      {/* ຝັ່ງຊ້າຍ: ສີຂຽວພຣີມຽມ ຕັດກັບສີຂາວ */}
      <div className="hidden lg:flex lg:w-1/2 bg-green-500 text-white p-12 flex-col justify-between relative overflow-hidden">
        
        {/* ລວດລາຍ Graphic ວົງກົມແບບລຽບງ່າຍ */}
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-green-500 rounded-full opacity-50 blur-2xl" />
        <div className="absolute -right-10 -bottom-10 w-[30rem] h-[30rem] bg-green-400 rounded-full opacity-50 blur-2xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="p-3 bg-white text-green-700 rounded-xl shadow-md">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-bold text-2xl tracking-wider text-white">ກົມຄຸ້ມຄອງການທ່ອງທ່ຽວ</h1>
            <p className="text-xs text-green-100 font-medium tracking-wide">Tourism Management Department, Ministry of Culture and Tourism</p>
          </div>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-800/50 border border-green-500/30 text-green-50 text-sm font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>ລະບົບຄຸ້ມຄອງການເງິນ ແລະ ຊັບສິນ</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight text-white">
            ບໍລິຫານການເງິນຂອງກົມ <br />
            <span className="text-green-300">ຢ່າງມີປະສິດທິພາບ</span>
          </h2>
          
          <p className="text-green-100 text-base leading-relaxed">
            ທັນສະໄໝ, ປອດໄພ, ໂປ່ງໃສ ແລະ ຄຸ້ມຄອງງົບປະມານຢ່າງມີປະສິດທິພາບ <br />
            <span className="text">ດ້ວຍລະບົບເອເລັກໂຕຣນິກ ຂອງກົມຄຸ້ມຄອງການທ່ອງທ່ຽວ.</span>
          </p>
        </div>

        <div className="relative z-10 text-xs text-green-200/80 font-medium">
          © {new Date().getFullYear()} TMD Financial Management System. All rights reserved.
        </div>
      </div>

      {/* ຝັ່ງຂວາ: ຟອມ Login (ພື້ນຂາວສະອາດ Light Theme) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white lg:bg-transparent">
        <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-2xl lg:shadow-xl lg:shadow-slate-200/50 lg:border lg:border-slate-100">
          
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-green-50 text-green-600 rounded-xl mb-2 lg:hidden border border-green-100">
              <Building2 className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">ເຂົ້າສູ່ລະບົບ</h2>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              ກະລຸນາປ້ອນຂໍ້ມູນບັນຊີຂອງທ່ານເພື່ອເຂົ້າໃຊ້ງານລະບົບ
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider pl-1">
                ຊື່ຜູ້ໃຊ້ (Username)
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 focus:bg-white transition-all text-slate-900 text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider pl-1">
                ລະຫັດຜ່ານ (Password)
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 focus:bg-white transition-all text-slate-900 text-sm font-medium"
                />
              </div>
            </div>

            {/* ປຸ່ມກົດສີຂຽວເຂັ້ມ ຕັດກັບພື້ນຂາວ */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-green-600 hover:bg-green-500 active:bg-green-800 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 group transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>ກຳລັງກວດສອບ...</span>
              ) : (
                <>
                  <span>ເຂົ້າສູ່ລະບົບ</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-4 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-400">FMS v1.0 | ລະບົບຄຸ້ມຄອງການເງິນ ແລະ ຊັບສິນ</p>
          </div>
        </div>
      </div>
    </div>
  );
}