import Swal from "sweetalert2";

// 💡 Pop-up ແຈ້ງເຕືອນສຳເລັດ (Success)
export const showSuccess = (title: string, text?: string) => {
  return Swal.fire({
    icon: "success",
    title: title,
    text: text || "",
    confirmButtonText: "ຕົກລົງ",
    confirmButtonColor: "#16a34a", // ສີຂຽວ Tailwind
    customClass: {
      popup: "rounded-3xl p-6 font-sans",
      confirmButton: "px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg",
    },
  });
};

// 💡 Pop-up ແຈ້ງເຕືອນຂໍ້ຜິດພາດ (Error)
export const showError = (title: string, text?: string) => {
  return Swal.fire({
    icon: "error",
    title: title,
    text: text || "",
    confirmButtonText: "ຕົກລົງ",
    confirmButtonColor: "#dc2626", // ສີແດງ Tailwind
    customClass: {
      popup: "rounded-3xl p-6 font-sans",
      confirmButton: "px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg",
    },
  });
};

// 💡 Pop-up ຢືນຢັນການດຳເນີນການ (Confirm Dialog)
export const showConfirm = async (
  title: string,
  text: string,
  confirmButtonText: string = "ຢືນຢັນ",
  isDanger: boolean = false
) => {
  const result = await Swal.fire({
    icon: isDanger ? "warning" : "question",
    title: title,
    text: text,
    showCancelButton: true,
    confirmButtonText: confirmButtonText,
    cancelButtonText: "ຍົກເລີກ",
    confirmButtonColor: isDanger ? "#dc2626" : "#2563eb", // ສີແດງ ຖ້າເປັນການລົບ, ສີຟ້າ ຖ້າເປັນທົ່ວໄປ
    cancelButtonColor: "#94a3b8",
    reverseButtons: true,
    customClass: {
      popup: "rounded-3xl p-6 font-sans",
      confirmButton: "px-5 py-2.5 rounded-xl font-bold text-xs shadow-md",
      cancelButton: "px-5 py-2.5 rounded-xl font-bold text-xs shadow-md",
    },
  });

  return result.isConfirmed; // ຈະຄືນຄ່າ true ຖ້າກົດ ຢືນຢັນ, false ຖ້າກົດ ຍົກເລີກ
};