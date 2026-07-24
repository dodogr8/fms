import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: ດຶງຂໍ້ມູນສະຫຼຸບຕົວເລກປະຈຳປີ
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");
    const selectedYear = yearParam ? parseInt(yearParam) : new Date().getFullYear();

    const incomes: any[] = await prisma.income.findMany();
    const expenses: any[] = await prisma.expense.findMany();
    const closingHistory: any[] = (prisma as any).yearlyClose 
      ? await (prisma as any).yearlyClose.findMany({ orderBy: { year: "desc" } })
      : [];

    const yearIncomes = incomes.filter((item: any) => {
      if (!item.date) return false;
      const y = new Date(item.date).getFullYear();
      return y === selectedYear;
    });

    const yearExpenses = expenses.filter((item: any) => {
      if (!item.date) return false;
      const y = new Date(item.date).getFullYear();
      return y === selectedYear;
    });

    let regularIncomeTotal = 0;
    let feeTotal = 0;
    let serviceTotal = 0;

    yearIncomes.forEach((item: any) => {
      if (item.incomeType === "FEE_SERVICE") {
        feeTotal += Number(item.feeAmount || 0);
        serviceTotal += Number(item.serviceAmount || 0);
      } else {
        regularIncomeTotal += Number(item.amount || 0);
      }
    });

    const totalExpense = yearExpenses.reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
    const netBalance = regularIncomeTotal - totalExpense;

    const currentYearStatus = closingHistory.find((item: any) => item.year === selectedYear);

    return NextResponse.json({
      year: selectedYear,
      regularIncomeTotal,
      feeTotal,
      serviceTotal,
      totalExpense,
      netBalance,
      isClosed: currentYearStatus?.isClosed || false,
      closingHistory,
    });
  } catch (error: any) {
    console.error("GET Annual Summary Error:", error);
    return NextResponse.json({ message: "ບໍ່ສາມາດດຶງຂໍ້ມູນໄດ້" }, { status: 500 });
  }
}

// POST: ກົດປິດບັນຊີ ຫຼື 🔓 ຍົກເລີກການປິດບັນຊີ
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { year, action, closedBy } = body; // action: "CLOSE" | "REOPEN"

    const targetYear = parseInt(year);
    const nextYear = targetYear + 1;

    // 💡 ຖ້າເປັນການ "🔓 ຍົກເລີກການປິດບັນຊີ (REOPEN)"
    if (action === "REOPEN") {
      // 1. ອັບເດດສະຖານະໃນ YearlyClose ເປັນ false
      if ((prisma as any).yearlyClose) {
        await (prisma as any).yearlyClose.update({
          where: { year: targetYear },
          data: { isClosed: false },
        });
      }

      // 2. ລົບລາຍການເງິນຍົກຍອດໃນປີຖັດໄປ (ເພື່ອບໍ່ໃຫ້ຍອດເງິນຊ້ຳຊ້ອນ)
      await prisma.income.deleteMany({
        where: {
          referenceNo: `BAL-FWD-${targetYear}`,
        },
      });

      return NextResponse.json({
        message: `🔓 ຍົກເລີກການປິດບັນຊີປີ ${targetYear} ສຳເລັດ! ທ່ານສາມາດແກ້ໄຂຂໍ້ມູນ ແລະ ກົດປິດບັນຊີໃໝ່ໄດ້.`,
      });
    }

    // 💡 ຖ້າເປັນການ "🔒 ປິດບັນຊີ (CLOSE)"
    const incomes: any[] = await prisma.income.findMany();
    const expenses: any[] = await prisma.expense.findMany();

    const yearIncomes = incomes.filter((i: any) => i.date && new Date(i.date).getFullYear() === targetYear);
    const yearExpenses = expenses.filter((e: any) => e.date && new Date(e.date).getFullYear() === targetYear);

    let regularIncomeTotal = 0;
    yearIncomes.forEach((item: any) => {
      if (item.incomeType !== "FEE_SERVICE") {
        regularIncomeTotal += Number(item.amount || 0);
      }
    });

    const totalExpense = yearExpenses.reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
    const netBalance = regularIncomeTotal - totalExpense;

    let yearlyRecord = null;
    if ((prisma as any).yearlyClose) {
      yearlyRecord = await (prisma as any).yearlyClose.upsert({
        where: { year: targetYear },
        update: {
          regularIncome: regularIncomeTotal,
          totalExpense: totalExpense,
          endingBalance: netBalance,
          isClosed: true,
          closedAt: new Date(),
          closedBy: closedBy || "ADMIN",
        },
        create: {
          year: targetYear,
          regularIncome: regularIncomeTotal,
          totalExpense: totalExpense,
          endingBalance: netBalance,
          isClosed: true,
          closedAt: new Date(),
          closedBy: closedBy || "ADMIN",
        },
      });
    }

    // ບັນທຶກເຂົ້າຕາຕະລາງ Income ຂອງປີໃໝ່
    if (netBalance > 0) {
      const nextYearDate = `${nextYear}-01-01`;

      const existingForward = await prisma.income.findFirst({
        where: {
          referenceNo: `BAL-FWD-${targetYear}`,
        },
      });

      if (!existingForward) {
        await prisma.income.create({
          data: {
            referenceNo: `BAL-FWD-${targetYear}`,
            date: nextYearDate,
            incomeType: "REGULAR",
            categoryName: "ເງິນຍົກຍອດມາຈາກປີກ່ອນ",
            description: `ເງິນເຫຼືອຍົກຍອດສະຫຼຸບຈົບຊັ້ນຈາກປີ ${targetYear}`,
            disburser: `ຫ້ອງການ (ຍົກຍອດປີ ${targetYear})`,
            receiver: "ຄັງເງິນບໍລິຫານ",
            amount: netBalance,
            remark: `ຍົກຍອດອັດຕະໂນມັດຈາກການປິດບັນຊີປີ ${targetYear}`,
          } as any,
        });
      } else {
        await prisma.income.update({
          where: { id: existingForward.id },
          data: {
            amount: netBalance,
            date: nextYearDate,
            description: `ເງິນເຫຼືອຍົກຍອດສະຫຼຸບຈົບຊັ້ນຈາກປີ ${targetYear}`,
          },
        });
      }
    }

    return NextResponse.json({
      message: `🔒 ປິດບັນຊີປີ ${targetYear} ສຳເລັດ! ຍົກຍອດເງິນ ${netBalance.toLocaleString()} ກີບ ໄປປີ ${nextYear} ແລ້ວ.`,
      record: yearlyRecord,
    });
  } catch (error: any) {
    console.error("POST Annual Close Error:", error);
    return NextResponse.json(
      { message: `Database Error: ${error?.message || "ບໍ່ສາມາດດຳເນີນການໄດ້"}` },
      { status: 500 }
    );
  }
}