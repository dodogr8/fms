import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: ດຶງຂໍ້ມູນງົບປະມານທັງໝົດ
export async function GET() {
  try {
    const budgets = await prisma.budget.findMany({
      orderBy: { id: "desc" },
    });
    return NextResponse.json(budgets);
  } catch (error) {
    return NextResponse.json({ message: "ບໍ່ສາມາດດຶງຂໍ້ມູນງົບປະມານໄດ້" }, { status: 500 });
  }
}

// POST: ບັນທຶກງົບປະມານໃໝ່ + ສ້າງລາຍຮັບອັດຕະໂນມັດຖ້າມີການຫັກເງິນບໍລິຫານ
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      projectName, 
      categoryName, 
      totalAmount, 
      isDeduct, 
      deductType, 
      deductValue, 
      deductAmount, 
      netAmount, 
      startDate, 
      endDate, 
      detail 
    } = body;

    if (!projectName || !totalAmount) {
      return NextResponse.json({ message: "ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ" }, { status: 400 });
    }

    // 1. ບັນທຶກຂໍ້ມູນ Budget
    const newBudget = await prisma.budget.create({
      data: {
        projectName,
        categoryName,
        totalAmount: parseFloat(totalAmount),
        isDeduct: Boolean(isDeduct),
        deductType,
        deductValue: parseFloat(deductValue || 0),
        deductAmount: parseFloat(deductAmount || 0),
        netAmount: parseFloat(netAmount),
        usedAmount: 0,
        startDate,
        endDate,
        detail,
      },
    });

    // 2. 💡 ຖ້າມີການຫັກເງິນບໍລິຫານ > ໃຫ້ບັນທຶກເຂົ້າເປັນລາຍຮັບ (Income) ອັດຕະໂນມັດ!
    if (isDeduct && parseFloat(deductAmount) > 0) {
      await prisma.income.create({
        data: {
          referenceNo: `ADM-${Date.now().toString().slice(-4)}`,
          date: startDate || new Date().toISOString().split("T")[0],
          description: `ຫັກເງິນບໍລິຫານຈາກໂຄງການ: ${projectName}`,
          disburser: projectName,
          receiver: "ຄັງເງິນບໍລິຫານຫ້ອງການ",
          amount: parseFloat(deductAmount),
          remark: `ສ່ວນແບ່ງບໍລິຫານ ${deductType === "percent" ? `${deductValue}%` : "ເງິນສົດ"}`,
        },
      });
    }

    return NextResponse.json(newBudget, { status: 201 });
  } catch (error) {
    console.error("Budget Post Error:", error);
    return NextResponse.json({ message: "ບັນທຶກຂໍ້ມູນງົບປະມານບໍ່ສຳເລັດ" }, { status: 500 });
  }
}