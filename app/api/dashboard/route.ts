import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. ດຶງຂໍ້ມູນລາຍຮັບທັງໝົດ
    const incomes = await prisma.income.findMany({ orderBy: { id: "desc" } });
    const totalIncomes = incomes.reduce((sum, item) => sum + Number(item.amount), 0);

    // 2. ດຶງຂໍ້ມູນລາຍຈ່າຍທັງໝົດ
    const expenses = await prisma.expense.findMany({ orderBy: { id: "desc" } });
    const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

    // 3. ດຶງຂໍ້ມູນງົບປະມານໂຄງການ
    const budgets = await prisma.budget.findMany();
    const totalBudgets = budgets.reduce((sum, item) => sum + Number(item.totalAmount), 0);

    // 4. ດຶງຂໍ້ມູນຊັບສິນ
    const assets = await prisma.asset.findMany();
    const totalAssetsValue = assets.reduce((sum, item) => sum + Number(item.price), 0);

    // 5. ລາຍການເຄື່ອນໄຫວລ່າສຸດ (ລວມ 5 ລາຍການທັງຮັບ ແລະ ຈ່າຍ)
    const recentIncomes = incomes.slice(0, 5).map((i) => ({
      id: `inc-${i.id}`,
      type: "income",
      title: i.description,
      date: i.date,
      amount: i.amount,
      refNo: i.referenceNo || "-",
    }));

    const recentExpenses = expenses.slice(0, 5).map((e) => ({
      id: `exp-${e.id}`,
      type: "expense",
      title: e.description,
      date: e.date,
      amount: e.amount,
      refNo: e.referenceNo || "-",
    }));

    // ລວມ ແລະ ຮຽງວັນທີ
    const recentTransactions = [...recentIncomes, ...recentExpenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return NextResponse.json({
      summary: {
        totalIncomes,
        totalExpenses,
        balance: totalIncomes - totalExpenses, // ຍອດເຫຼືອຄັງ
        totalBudgets,
        totalAssetsValue,
        assetsCount: assets.length,
      },
      recentTransactions,
      budgets,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ message: "ບໍ່ສາມາດດຶງຂໍ້ມູນ Dashboard ໄດ້" }, { status: 500 });
  }
}