import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: ດຶງຂໍ້ມູນລາຍຮັບທັງໝົດ
export async function GET() {
  try {
    const incomes = await prisma.income.findMany({
      orderBy: { id: "desc" },
    });
    return NextResponse.json(incomes);
  } catch (error) {
    return NextResponse.json({ message: "ບໍ່ສາມາດດຶງຂໍ້ມູນໄດ້" }, { status: 500 });
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