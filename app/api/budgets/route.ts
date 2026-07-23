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

// POST: ເພີ່ມງົບປະມານໃໝ່ (ແບບປອດໄພ 100%)
export async function POST(request: Request) {
  try {
    // 1. ອ່ານຂໍ້ມູນແບບປອດໄພທີ່ສຸດ (ແກ້ບັນຫາ Invalid JSON)
    const bodyText = await request.text();
    let body = {};
    if (bodyText) {
      body = JSON.parse(bodyText);
    }

    const {
      projectName,
      categoryName,
      totalAmount,
      deductType,
      deductValue,
      startDate,
      endDate,
      detail,
    } = body as any;

    // 2. ກວດສອບຂໍ້ມູນ
    if (!projectName) {
      return NextResponse.json({ message: "ກະລຸນາປ້ອນຊື່ໂຄງການ" }, { status: 400 });
    }

    // 3. ແປງຄ່າເປັນຕົວເລກ (ປ້ອງກັນຄ່າວ່າງ ຫຼື NaN)
    const parsedTotal = Number(totalAmount) || 0;
    const parsedDeductVal = Number(deductValue) || 0;

    // 4. ຄິດໄລ່ເງິນບໍລິຫານ
    let adminFee = 0;
    if (deductType === "percent") {
      adminFee = (parsedTotal * parsedDeductVal) / 100;
    } else {
      adminFee = parsedDeductVal;
    }
    const netAmount = parsedTotal - adminFee;

    // 5. ບັນທຶກລົງ Database (ສະເພາະ Budget ເທົ່ານັ້ນ ເພື່ອປ້ອງກັນ Schema ຕຳກັນ)
    const newBudget = await prisma.budget.create({
      data: {
        projectName: String(projectName),
        categoryName: categoryName ? String(categoryName) : "ງົບປະມານໂຄງການ",
        totalAmount: parsedTotal,
        adminFee: adminFee,
        netAmount: netAmount,
        usedAmount: 0,
        startDate: startDate ? String(startDate) : new Date().toISOString().split("T")[0],
        endDate: endDate ? String(endDate) : null,
        detail: detail ? String(detail) : null,
      },
    });

    return NextResponse.json(newBudget, { status: 201 });
  } catch (error: any) {
    console.error("POST Budget Error:", error);
    // ສົ່ງ Error ທີ່ແທ້ຈິງອອກມາໃຫ້ເຫັນ ຖ້າມີບັນຫາອີກ
    return NextResponse.json(
      { message: `Database Error: ${error?.message || "ບໍ່ສາມາດບັນທຶກໄດ້"}` },
      { status: 500 }
    );
  }
}