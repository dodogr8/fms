import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: ດຶງຂໍ້ມູນລາຍຈ່າຍທັງໝົດ
export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { id: "desc" },
    });
    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json({ message: "ບໍ່ສາມາດດຶງຂໍ້ມູນລາຍຈ່າຍໄດ້" }, { status: 500 });
  }
}

// POST: ບັນທຶກລາຍຈ່າຍໃໝ່ + ອັບເດດຍອດໃຊ້ໄປໃນງົບປະມານໂຄງການ
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      referenceNo, 
      date, 
      category, 
      description, 
      disburser, 
      receiver, 
      amount, 
      budgetId, 
      budgetName, 
      remark 
    } = body;

    if (!description || !amount) {
      return NextResponse.json({ message: "ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ" }, { status: 400 });
    }

    const numericAmount = parseFloat(amount);

    // 1. ບັນທຶກລາຍຈ່າຍ
    const newExpense = await prisma.expense.create({
      data: {
        referenceNo,
        date,
        category: category || "ຄ່າບໍລິຫານທົ່ວໄປ",
        description,
        disburser,
        receiver,
        amount: numericAmount,
        budgetId: budgetId ? parseInt(budgetId) : null,
        budgetName: budgetName || null,
        remark,
      },
    });

    // 2. 💡 ຖ້າມີການຕັດຈາກງົບປະມານໂຄງການ > ອັບເດດ usedAmount ໃນ Model Budget ອັດຕະໂນມັດ!
    if (budgetId) {
      await prisma.budget.update({
        where: { id: parseInt(budgetId) },
        data: {
          usedAmount: {
            increment: numericAmount, // ບວກຍອດໃຊ້ໄປເພີ່ມ
          },
        },
      });
    }

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    console.error("Expense Post Error:", error);
    return NextResponse.json({ message: "ບັນທຶກຂໍ້ມູນລາຍຈ່າຍບໍ່ສຳເລັດ" }, { status: 500 });
  }
}