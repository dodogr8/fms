import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const incomeId = parseInt(resolvedParams.id);
    const body = await req.json();

    const {
      referenceNo,
      date,
      incomeType,
      categoryName,
      description,
      disburser,
      receiver,
      amount,
      feeAmount,
      serviceAmount,
      remark,
    } = body;

    const type = incomeType || "REGULAR";
    const parsedFee = Number(feeAmount) || 0;
    const parsedService = Number(serviceAmount) || 0;
    const finalAmount = type === "FEE_SERVICE" ? (parsedFee + parsedService) : (Number(amount) || 0);

    const updatedIncome = await prisma.income.update({
      where: { id: incomeId },
      data: {
        referenceNo: referenceNo ? String(referenceNo) : null,
        date: date ? String(date) : new Date().toISOString().split("T")[0],
        incomeType: type,
        categoryName: categoryName ? String(categoryName) : "ລາຍຮັບທົ່ວໄປ",
        description: String(description),
        disburser: disburser ? String(disburser) : null,
        receiver: receiver ? String(receiver) : null,
        amount: finalAmount,
        feeAmount: type === "FEE_SERVICE" ? parsedFee : 0,
        serviceAmount: type === "FEE_SERVICE" ? parsedService : 0,
        remark: remark ? String(remark) : null,
      },
    });

    return NextResponse.json(updatedIncome);
  } catch (error: any) {
    console.error("PUT Income Error:", error);
    return NextResponse.json(
      { message: error?.message || "ບໍ່ສາມາດອັບເດດຂໍ້ມູນໄດ້" },
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
    const incomeId = parseInt(resolvedParams.id);

    await prisma.income.delete({
      where: { id: incomeId },
    });

    return NextResponse.json({ message: "ລົບຂໍ້ມູນສຳເລັດ" });
  } catch (error) {
    console.error("DELETE Income Error:", error);
    return NextResponse.json(
      { message: "ບໍ່ສາມາດລົບຂໍ້ມູນໄດ້" },
      { status: 500 }
    );
  }
}