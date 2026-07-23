import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: ດຶງຂໍ້ມູນລາຍຈ່າຍທັງໝົດ (ລຽງຕາມວັນທີ ແລະ createdAt ລ່າສຸດ)
export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: [
        { date: "desc" },
        { createdAt: "desc" },
      ],
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

    if (budgetId) {
      await prisma.budget.update({
        where: { id: parseInt(budgetId) },
        data: {
          usedAmount: { increment: numericAmount },
        },
      });
    }

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    console.error("Expense Post Error:", error);
    return NextResponse.json({ message: "ບັນທຶກຂໍ້ມູນລາຍຈ່າຍບໍ່ສຳເລັດ" }, { status: 500 });
  }
}

// DELETE: ລົບຫຼາຍລາຍການ (Bulk Delete)
export async function DELETE(request: Request) {
  try {
    const { ids } = await request.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ message: "ກະລຸນາເລືອກລາຍການທີ່ຕ້ອງການລົບ" }, { status: 400 });
    }

    await prisma.expense.deleteMany({
      where: { id: { in: ids.map((id) => Number(id)) } },
    });

    return NextResponse.json({ message: "ລົບຂໍ້ມູນສຳເລັດ" });
  } catch (error) {
    return NextResponse.json({ message: "ບໍ່ສາມາດລົບຂໍ້ມູນໄດ້" }, { status: 500 });
  }
}