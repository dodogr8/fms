import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const budgetId = parseInt(resolvedParams.id);
    const body = await req.json();

    const {
      projectName,
      categoryName,
      totalAmount,
      deductType,
      deductValue,
      startDate,
      endDate,
      detail,
    } = body;

    const parsedTotal = Number(totalAmount) || 0;
    const parsedDeductVal = Number(deductValue) || 0;

    const existingBudget = await prisma.budget.findUnique({
      where: { id: budgetId },
    });

    if (!existingBudget) {
      return NextResponse.json({ message: "ບໍ່ພົບຂໍ້ມູນໂຄງການ" }, { status: 404 });
    }

    // ຄິດໄລ່ຄ່າຫັກບໍລິຫານໃໝ່
    let calculatedDeductAmount = 0;
    const currentDeductType = deductType || existingBudget.deductType || "percent";

    if (currentDeductType === "percent") {
      calculatedDeductAmount = (parsedTotal * parsedDeductVal) / 100;
    } else {
      calculatedDeductAmount = parsedDeductVal;
    }

    const calculatedNetAmount = parsedTotal - calculatedDeductAmount;
    const hasDeduct = calculatedDeductAmount > 0;

    const updatedBudget = await prisma.budget.update({
      where: { id: budgetId },
      data: {
        projectName: String(projectName),
        categoryName: categoryName && String(categoryName).trim() !== "" ? String(categoryName) : existingBudget.categoryName,
        totalAmount: parsedTotal,
        isDeduct: hasDeduct,
        deductType: currentDeductType,
        deductValue: parsedDeductVal,
        deductAmount: calculatedDeductAmount,
        netAmount: calculatedNetAmount,
        startDate: startDate ? String(startDate) : existingBudget.startDate,
        endDate: endDate ? String(endDate) : existingBudget.endDate,
        detail: detail ? String(detail) : existingBudget.detail,
      },
    });

    return NextResponse.json(updatedBudget);
  } catch (error: any) {
    console.error("PUT Budget Error:", error);
    return NextResponse.json(
      { message: error?.message || "ບໍ່ສາມາດອັບເດດຂໍ້ມູນງົບປະມານໄດ້" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const budgetId = parseInt(resolvedParams.id);

    await prisma.budget.delete({
      where: { id: budgetId },
    });

    return NextResponse.json({ message: "ລົບງົບປະມານສຳເລັດ" });
  } catch (error) {
    console.error("DELETE Budget Error:", error);
    return NextResponse.json(
      { message: "ບໍ່ສາມາດລົບງົບປະມານໄດ້" },
      { status: 500 }
    );
  }
}