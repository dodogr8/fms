import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: ດຶງຂໍ້ມູນລາຍຮັບທັງໝົດ (ລຽງຕາມວັນທີ ແລະ createdAt ລ່າສຸດ)
export async function GET() {
  try {
    const incomes = await prisma.income.findMany({
      orderBy: [
        { date: "desc" },
        { createdAt: "desc" },
      ],
    });
    return NextResponse.json(incomes);
  } catch (error) {
    return NextResponse.json({ message: "ບໍ່ສາມາດດຶງຂໍ້ມູນລາຍຮັບໄດ້" }, { status: 500 });
  }
}

// POST: ບັນທຶກລາຍຮັບໃໝ່
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { referenceNo, date, description, disburser, receiver, amount, remark } = body;

    if (!description || !amount) {
      return NextResponse.json({ message: "ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ" }, { status: 400 });
    }

    const newIncome = await prisma.income.create({
      data: {
        referenceNo,
        date,
        description,
        disburser,
        receiver,
        amount: parseFloat(amount),
        remark,
      },
    });

    return NextResponse.json(newIncome, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "ບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ" }, { status: 500 });
  }
}

// DELETE: ລົບຫຼາຍລາຍການ (Bulk Delete)
export async function DELETE(request: Request) {
  try {
    const { ids } = await request.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ message: "ກະລຸນາເລືອກລາຍການທີ່ຕ້ອງການລົບ" }, { status: 400 });
    }

    await prisma.income.deleteMany({
      where: { id: { in: ids.map((id) => Number(id)) } },
    });

    return NextResponse.json({ message: "ລົບຂໍ້ມູນສຳເລັດ" });
  } catch (error) {
    return NextResponse.json({ message: "ບໍ່ສາມາດລົບຂໍ້ມູນໄດ້" }, { status: 500 });
  }
}