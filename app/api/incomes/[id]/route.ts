import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT: ແກ້ໄຂລາຍຮັບຕາມ ID
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const incomeId = parseInt(resolvedParams.id);
    const body = await request.json();

    const updatedIncome = await prisma.income.update({
      where: { id: incomeId },
      data: {
        referenceNo: body.referenceNo,
        date: body.date,
        description: body.description,
        disburser: body.disburser,
        receiver: body.receiver,
        amount: parseFloat(body.amount),
        remark: body.remark,
      },
    });

    return NextResponse.json(updatedIncome);
  } catch (error) {
    return NextResponse.json({ message: "ບໍ່ສາມາດແກ້ໄຂຂໍ້ມູນໄດ້" }, { status: 500 });
  }
}

// DELETE: ລົບລາຍຮັບ 1 ລາຍການ
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const incomeId = parseInt(resolvedParams.id);

    await prisma.income.delete({
      where: { id: incomeId },
    });

    return NextResponse.json({ message: "ລົບຂໍ້ມູນສຳເລັດ" });
  } catch (error) {
    return NextResponse.json({ message: "ບໍ່ສາມາດລົບຂໍ້ມູນໄດ້" }, { status: 500 });
  }
}