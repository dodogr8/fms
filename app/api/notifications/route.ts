import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const notifications: any[] = [];

    // 1. ດຶງຂໍ້ມູນລາຍຮັບລ້າສຸດ 3 ລາຍການ
    const recentIncomes = await prisma.income.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
    });

    recentIncomes.forEach((item) => {
      notifications.push({
        id: `inc-${item.id}`,
        title: "📥 ບັນທຶກລາຍຮັບໃໝ່",
        message: `${item.description} (ຍອດເງິນ: ${Number(item.amount).toLocaleString()} ກີບ)`,
        time: new Date(item.createdAt).toLocaleDateString("la-LA", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        createdAt: item.createdAt,
        type: "success",
      });
    });

    // 2. ດຶງຂໍ້ມູນລາຍຈ່າຍລ້າສຸດ 3 ລາຍການ
    const recentExpenses = await prisma.expense.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
    });

    recentExpenses.forEach((item) => {
      notifications.push({
        id: `exp-${item.id}`,
        title: "📤 ບັນທຶກລາຍຈ່າຍໃໝ່",
        message: `${item.description} (ຍອດເງິນ: ${Number(item.amount).toLocaleString()} ກີບ)`,
        time: new Date(item.createdAt).toLocaleDateString("la-LA", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        createdAt: item.createdAt,
        type: "info",
      });
    });

    // 3. ກວດສອບງົບປະມານໂຄງການທີ່ໃຊ້ຈ່າຍເກີນ 80% (Real-time warning)
    const budgets = await prisma.budget.findMany();
    budgets.forEach((b) => {
      const netAmount = Number(b.netAmount || b.totalAmount || 0);
      const usedAmount = Number(b.usedAmount || 0);
      if (netAmount > 0 && (usedAmount / netAmount) >= 0.8) {
        const percent = Math.round((usedAmount / netAmount) * 100);
        notifications.push({
          id: `bud-${b.id}`,
          title: "⚠️ ງົບປະມານໃກ້ຈະໝົດ",
          message: `ໂຄງການ "${b.projectName}" ໃຊ້ງົບປະມານໄປແລ້ວ ${percent}% (${usedAmount.toLocaleString()} / ${netAmount.toLocaleString()} ກີບ)`,
          time: "ເຕືອນສະຖານະ",
          createdAt: b.updatedAt,
          type: "warning",
        });
      }
    });

    // 4. ຮຽງລຳດັບການເຄື່ອນໄຫວຕາມເວລາລ້າສຸດ (Newest First)
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(notifications.slice(0, 8)); // ດຶງມາສະແດງ 8 ລາຍການລ້າສຸດ
  } catch (error: any) {
    console.error("GET Notifications Error:", error);
    return NextResponse.json([], { status: 500 });
  }
}