// 1. ແປງຂໍ້ຄວາມທີ່ມີຈຸດ ໃຫ້ເປັນ ຕົວເລກທີ່ມີຈຸດອັດຕະໂນມັດ (ຕອນພິມໃນ Input)
export const formatNumberInput = (value: string): string => {
  if (!value) return "";
  // ລຶບໂຕອັກສອນອື່ນໆທັງໝົດອອກ ໃຫ້ເຫຼືອແຕ່ໂຕເລກ
  const cleanNumber = value.replace(/\D/g, "");
  if (!cleanNumber) return "";
  // ໃສ່ເຄື່ອງໝາຍຈຸດຄັ່ນທຸກໆ 3 ຫຼັກ
  return Number(cleanNumber).toLocaleString("en-US");
};

// 2. ແປງຂໍ້ຄວາມທີ່ມີຈຸດ ໃຫ້ກັບເປັນ ຕົວເລກ pure number (ເພື່ອນຳໄປຄຳນວນ ຫຼື ສົ່ງລົງ DB)
export const parseFormattedNumber = (value: string): number => {
  if (!value) return 0;
  const cleanNumber = value.replace(/,/g, "");
  return parseFloat(cleanNumber) || 0;
};