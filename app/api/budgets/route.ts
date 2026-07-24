import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: ດຶງຂໍ້ມູນງົບປະມານ
export async function GET() {
  try {
    const budgets = await prisma.budget.findMany({
      orderBy: { id: "desc" },
    });
    return NextResponse.json(budgets);
  } catch (error) {
    console.error("GET Budgets Error:", error);
    return NextResponse.json({ message: "ບໍ່ສາມາດດຶງຂໍ້ມູນໄດ້" }, { status: 500 });
  }
}

// POST: ເພີ່ມງົບປະມານໃໝ່ + ບັນທຶກເງິນບໍລິຫານເຂົ້າໜ້າລາຍຮັບອັດຕະໂນມັດ
export async function POST(request: Request) {
  try {
    const body = await request.json();
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

    if (!projectName) {
      return NextResponse.json({ message: "ກະລຸນາປ້ອນຊື່ໂຄງການ" }, { status: 400 });
    }

    const parsedTotal = Number(totalAmount) || 0;
    const parsedDeductVal = Number(deductValue) || 0;

    // ຄິດໄລ່ຄ່າບໍລິຫານ/ຫັກ
    let calculatedDeductAmount = 0;
    if (deductType === "percent") {
      calculatedDeductAmount = (parsedTotal * parsedDeductVal) / 100;
    } else {
      calculatedDeductAmount = parsedDeductVal;
    }

    const calculatedNetAmount = parsedTotal - calculatedDeductAmount;
    const hasDeduct = calculatedDeductAmount > 0;
    const today = startDate ? String(startDate) : new Date().toISOString().split("T")[0];

    // 1. ບັນທຶກຂໍ້ມູນງົບປະມານລົງ Budget
    const newBudget = await prisma.budget.create({
      data: {
        projectName: String(projectName),
        categoryName: categoryName && String(categoryName).trim() !== "" ? String(categoryName) : "ງົບປະມານໂຄງການ",
        totalAmount: parsedTotal,
        isDeduct: hasDeduct,
        deductType: deductType || "percent",
        deductValue: parsedDeductVal,
        deductAmount: calculatedDeductAmount,
        netAmount: calculatedNetAmount,
        usedAmount: 0,
        startDate: today,
        endDate: endDate ? String(endDate) : null,
        detail: detail ? String(detail) : null,
      },
    });

    // 2. 💡 ຖ້າມີເງິນບໍລິຫານ (> 0), ໃຫ້ບັນທຶກເຂົ້າຕາຕະລາງ Income ອັດຕະໂນມັດ
    if (hasDeduct) {
      await prisma.income.create({
        data: {
          referenceNo: `ADM-${newBudget.id}`,
          date: today,
          categoryName: "ເງິນບໍລິຫານໂຄງການ",
          description: `ເງິນບໍລິຫານຫັກຈາກໂຄງການ: ${projectName}`,
          disburser: String(projectName),
          receiver: "ຄັງເງິນບໍລິຫານ",
          amount: calculatedDeductAmount,
          remark: `ຫັກອັດຕະໂນມັດຈາກງົບປະມານໂຄງການ (ID: ${newBudget.id})`,
        },
      });
    }

    return NextResponse.json(newBudget, { status: 201 });
  } catch (error: any) {
    console.error("POST Budget Error Detail:", error);
    return NextResponse.json(
      { message: `Database Error: ${error?.message || "ບໍ່ສາມາດບັນທຶກໄດ້"}` },
      { status: 500 }
    );
  }
}

// DELETE: ລົບງົບປະມານເທື່ອລະຫຼາຍລາຍການ (Bulk Delete)
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

    await prisma.budget.deleteMany({
      where: {
        id: {
          in: ids.map((id: any) => Number(id)),
        },
      },
    });

    return NextResponse.json({ message: "ລົບລາຍການທີ່ເລືອກສຳເລັດ" });
  } catch (error: any) {
    console.error("Bulk Delete Budgets Error:", error);
    return NextResponse.json(
      { message: error?.message || "ບໍ່ສາມາດລົບລາຍການທີ່ເລືອກໄດ້" },
      { status: 500 }
    );
  }
}