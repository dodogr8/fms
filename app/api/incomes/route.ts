import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const incomes = await prisma.income.findMany({
      orderBy: { id: "desc" },
    });
    return NextResponse.json(incomes);
  } catch (error) {
    console.error("GET Incomes Error:", error);
    return NextResponse.json({ message: "ບໍ່ສາມາດດຶງຂໍ້ມູນໄດ້" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
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

    if (!description) {
      return NextResponse.json({ message: "ກະລຸນາປ້ອນເນື້ອໃນລາຍການ" }, { status: 400 });
    }

    const type = incomeType || "REGULAR";
    const parsedFee = Number(feeAmount) || 0;
    const parsedService = Number(serviceAmount) || 0;

    // ຖ້າເປັນຄ່າທຳນຽມ&ບໍລິການ ຍອດລວມບິນຈະ = ທຳນຽມ + ບໍລິການ
    const finalAmount = type === "FEE_SERVICE" ? (parsedFee + parsedService) : (Number(amount) || 0);

    const newIncome = await prisma.income.create({
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

    return NextResponse.json(newIncome, { status: 201 });
  } catch (error: any) {
    console.error("POST Income Error:", error);
    return NextResponse.json(
      { message: `Database Error: ${error?.message || "ບໍ່ສາມາດບັນທຶກໄດ້"}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { message: "ກະລຸນາເລືອກລາຍການທີ່ຕ້ອງການລົບ" },
        { status: 400 }
      );
    }

    await prisma.income.deleteMany({
      where: {
        id: {
          in: ids.map((id: any) => Number(id)),
        },
      },
    });

    return NextResponse.json({ message: "ລົບລາຍການທີ່ເລືອກສຳເລັດ" });
  } catch (error: any) {
    console.error("Bulk Delete Incomes Error:", error);
    return NextResponse.json(
      { message: error?.message || "ບໍ່ສາມາດລົບລາຍການທີ່ເລືອກໄດ້" },
      { status: 500 }
    );
  }
}