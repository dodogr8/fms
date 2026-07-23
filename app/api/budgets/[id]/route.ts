import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT: ແກ້ໄຂງົບປະມານ
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const budgetId = parseInt(resolvedParams.id);
    const body = await request.json();

    const total = parseFloat(body.totalAmount);
    const dValue = body.deductValue ? parseFloat(body.deductValue) : 0;
    
    let adminFee = 0;
    if (body.deductType === "percent") {
      adminFee = (total * dValue) / 100;
    } else {
      adminFee = dValue;
    }

    const netAmount = total - adminFee;

    const updatedBudget = await prisma.budget.update({
      where: { id: budgetId },
      data: {
        projectName: body.projectName,
        categoryName: body.categoryName,
        totalAmount: total,
        adminFee,
        netAmount,
        startDate: body.startDate,
        endDate: body.endDate,
        detail: body.detail,
      },
    });

    return NextResponse.json(updatedBudget);
  } catch (error) {
    return NextResponse.json({ message: "ບໍ່ສາມາດແກ້ໄຂຂໍ້ມູນໄດ້" }, { status: 500 });
  }
}

// DELETE: ລົບງົບປະມານ 1 ລາຍການ
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const budgetId = parseInt(resolvedParams.id);

    await prisma.budget.delete({
      where: { id: budgetId },
    });

    return NextResponse.json({ message: "ລົບຂໍ້ມູນສຳເລັດ" });
  } catch (error) {
    return NextResponse.json({ message: "ບໍ່ສາມາດລົບຂໍ້ມູນໄດ້" }, { status: 500 });
  }
}