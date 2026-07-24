"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Menu, CheckCircle2, AlertTriangle, Info, X, RefreshCw } from "lucide-react";

interface NavbarProps {
  title?: string;
  userName?: string;
  userRole?: string;
  onToggleSidebar?: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "warning" | "info" | "success";
  isRead?: boolean;
}

export default function Navbar({ 
  title = "ໜ້າຫຼັກ (Dashboard)", 
  userName: initialUserName, 
  userRole: initialUserRole,
  onToggleSidebar
}: NavbarProps) {
  
  const [currentUser, setCurrentUser] = useState({
    name: initialUserName || "ຜູ້ໃຊ້ງານລະບົບ",
    role: initialUserRole || "ADMIN",
  });

  const [showNotiDropdown, setShowNotiDropdown] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readNotiIds, setReadNotiIds] = useState<string[]>([]);
  const [loadingNoti, setLoadingNoti] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 💡 ດຶງຂໍ້ມູນ User ຕົວຈິງ
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        let displayName = "ຜູ້ໃຊ້ງານລະບົບ";
        if (parsed.fullName) displayName = parsed.fullName;
        else if (parsed.firstName || parsed.lastName) displayName = `${parsed.firstName || ""} ${parsed.lastName || ""}`.trim();
        else if (parsed.name) displayName = parsed.name;
        else if (parsed.username) displayName = parsed.username;

        setCurrentUser({
          name: displayName,
          role: parsed.role || "ADMIN",
        });
      } catch (e) {}
    }
  }, [initialUserName, initialUserRole]);

  // 💡 ດຶງຂໍ້ມູນ Notifications ຕົວຈິງຈາກ API
  const fetchRealNotifications = async () => {
    setLoadingNoti(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Fetch Notifications Error:", err);
    } finally {
      setLoadingNoti(false);
    }
  };

  useEffect(() => {
    fetchRealNotifications();
  }, []);

  // 💡 ປິດ Dropdown ເມື່ອກົດພື້ນຫຼັງຂ້າງນອກ
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotiDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRoleText = (role: string) => {
    switch (role) {
      case "ADMIN": return "ຜູ້ເບິ່ງແຍງລະບົບ (Admin)";
      case "DIRECTOR": return "ຫົວໜ້າກົມ / ຫ້ອງການ";
      case "FINANCE_STAFF": return "ພະນັກງານການເງິນ";
      case "ASSET_STAFF": return "ພະນັກງານຊັບສິນ";
      default: return "ພະນັກງານ";
    }
  };

  // ຈຳນວນແຈ້ງເຕືອນທີ່ຍັງບໍ່ທັນກົດອ່ານ
  const unreadNotifications = notifications.filter((n) => !readNotiIds.includes(n.id));

  const handleMarkAllRead = () => {
    setReadNotiIds(notifications.map((n) => n.id));
  };

  const handleRemoveNoti = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all active:scale-95"
            title="ຊ່ອນ/ສະແດງ ເມນູ"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-base sm:text-lg font-bold text-slate-800 truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* 🔔 1. ປຸ່ມ ແລະ Dropdown ແຈ້ງເຕືອນຕົວຈິງ */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => {
              setShowNotiDropdown(!showNotiDropdown);
              if (!showNotiDropdown) fetchRealNotifications();
            }}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl relative transition-all active:scale-95"
            title="ການແຈ້ງເຕືອນ"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications.length > 0 && (
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full absolute top-2 right-2 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {showNotiDropdown && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 py-3 z-50 animate-fadeIn">
              <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 text-sm">ການເຄື່ອນໄຫວລ້າສຸດ</h3>
                  {unreadNotifications.length > 0 && (
                    <span className="bg-green-100 text-green-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      {unreadNotifications.length} ໃໝ່
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchRealNotifications}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                    title="ໂຫຼດໃໝ່"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingNoti ? "animate-spin" : ""}`} />
                  </button>
                  {unreadNotifications.length > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      ອ່ານທັງໝົດ
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {notifications.length > 0 ? (
                  notifications.map((item) => {
                    const isUnread = !readNotiIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors relative group ${
                          isUnread ? "bg-slate-50/80" : ""
                        }`}
                      >
                        <div className="shrink-0 mt-0.5">
                          {item.type === "warning" && (
                            <div className="p-2 bg-amber-50 text-amber-500 rounded-xl">
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                          )}
                          {item.type === "info" && (
                            <div className="p-2 bg-blue-50 text-blue-500 rounded-xl">
                              <Info className="w-4 h-4" />
                            </div>
                          )}
                          {item.type === "success" && (
                            <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center justify-between gap-1">
                            <p className={`text-xs font-bold ${isUnread ? "text-slate-900" : "text-slate-700"}`}>
                              {item.title}
                            </p>
                            <span className="text-[10px] text-slate-400 font-medium shrink-0">{item.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                            {item.message}
                          </p>
                        </div>

                        <button
                          onClick={() => handleRemoveNoti(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 rounded-lg absolute right-2 top-3 transition-opacity"
                          title="ລົບ"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400 font-medium">
                    ຍັງບໍ່ທັນມີການເຄື່ອນໄຫວໃໝ່ໃນລະບົບ
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200" />

        {/* 👤 2. ຂໍ້ມູນ ຊື່ ແລະ ນາມສະກຸນ ຜູ້ໃຊ້ງານ */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-600 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-md shadow-green-600/20 shrink-0">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>

          <div className="hidden sm:block text-left leading-tight">
            <h4 className="font-bold text-slate-800 text-xs truncate max-w-[180px]">
              {currentUser.name}
            </h4>
            <span className="text-[10px] font-semibold text-slate-400 block">
              {getRoleText(currentUser.role)}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}