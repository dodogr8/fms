import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: ດຶງຂໍ້ມູນງົບປະມານທັງໝົດ (ລຽງຕາມ startDate ແລະ createdAt ລ່າສຸດ)
export async function GET() {
  try {
    const budgets = await prisma.budget.findMany({
      orderBy: [
        { startDate: "desc" },
        { createdAt: "desc" },
      ],
    });
    return NextResponse.json(budgets);
  } catch (error) {
    return NextResponse.json({ message: "ບໍ່ສາມາດດຶງຂໍ້ມູນງົບປະມານໄດ້" }, { status: 500 });
  }
}

// POST: ບັນທຶກງົບປະມານໂຄງການໃໝ່
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
      detail 
    } = body;

    if (!projectName || !totalAmount) {
      return NextResponse.json({ message: "ກະລຸນາປ້ອນຊື່ໂຄງການ ແລະ ງົບປະມານລວມ" }, { status: 400 });
    }

    const total = parseFloat(totalAmount);
    const dValue = deductValue ? parseFloat(deductValue) : 0;
    
    let adminFee = 0;
    if (deductType === "percent") {
      adminFee = (total * dValue) / 100;
    } else {
      adminFee = dValue;
    }

    const netAmount = total - adminFee;

    const newBudget = await prisma.budget.create({
      data: {
        projectName,
        categoryName: categoryName || "ໂຄງການພັດທະນາ",
        totalAmount: total,
        adminFee,
        netAmount,
        usedAmount: 0,
        startDate: startDate || new Date().toISOString().split("T")[0],
        endDate: endDate || "",
        detail: detail || "",
      },
    });

    if (adminFee > 0) {
      await prisma.income.create({
        data: {
          referenceNo: `ADM-${newBudget.id}`,
          date: startDate || new Date().toISOString().split("T")[0],
          description: `ເງິນບໍລິຫານ (%) ຕັດຈາກໂຄງການ: ${projectName}`,
          disburser: "ໂຄງການງົບປະມານ",
          receiver: "ຄັງເງິນບໍລິຫານ",
          amount: adminFee,
          remark: `ຕັດບໍລິຫານ ${deductType === 'percent' ? `${dValue}%` : `${dValue.toLocaleString()} ກີບ`}`,
        },
      });
    }

    return NextResponse.json(newBudget, { status: 201 });
  } catch (error) {
    console.error("Budget Post Error:", error);
    return NextResponse.json({ message: "ບັນທຶກຂໍ້ມູນງົບປະມານບໍ່ສຳເລັດ" }, { status: 500 });
  }
}

// DELETE: ລົບຫຼາຍລາຍການ (Bulk Delete)
export async function DELETE(request: Request) {
  try {
    const { ids } = await request.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ message: "ກະລຸນາເລືອກລາຍການທີ່ຕ້ອງການລົບ" }, { status: 400 });
    }

    await prisma.budget.deleteMany({
      where: { id: { in: ids.map((id) => Number(id)) } },
    });

    return NextResponse.json({ message: "ລົບຂໍ້ມູນສຳເລັດ" });
  } catch (error) {
    return NextResponse.json({ message: "ບໍ່ສາມາດລົບຂໍ້ມູນໄດ້" }, { status: 500 });
  }
}