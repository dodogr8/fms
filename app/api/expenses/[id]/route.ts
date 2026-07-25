import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT: ແກ້ໄຂລາຍຈ່າຍຕາມ ID
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const expenseId = parseInt(resolvedParams.id);
    const body = await request.json();

    const updatedExpense = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        referenceNo: body.referenceNo,
        date: body.date,
        category: body.category,
        description: body.description,
        disburser: body.disburser,
        receiver: body.receiver,
        amount: parseFloat(body.amount),
        budgetId: body.budgetId ? parseInt(body.budgetId) : null,
        budgetName: body.budgetName || null,
        remark: body.remark,
      },
    });

    return NextResponse.json(updatedExpense);
  } catch (error) {
    return NextResponse.json({ message: "ບໍ່ສາມາດແກ້ໄຂຂໍ້ມູນໄດ້" }, { status: 500 });
  }
}

// DELETE: ລົບລາຍຈ່າຍ 1 ລາຍການ
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const expenseId = parseInt(resolvedParams.id);

    await prisma.expense.delete({
      where: { id: expenseId },
    });

    return NextResponse.json({ message: "ລົບຂໍ້ມູນສຳເລັດ" });
  } catch (error) {
    return NextResponse.json({ message: "ບໍ່ສາມາດລົບຂໍ້ມູນໄດ້" }, { status: 500 });
  }
}