import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const selectedYear = searchParams.get("year") 
      ? parseInt(searchParams.get("year")!) 
      : new Date().getFullYear();

    // 0️⃣ ດຶງ Categories ທັງໝົດໄວ້ Map (Map ທັງ string ID, number ID, ແລະ Code)
    let categoriesMap: { [key: string]: any } = {};
    try {
      const allCategories = await (prisma as any).category.findMany();
      allCategories.forEach((cat: any) => {
        categoriesMap[String(cat.id)] = cat;
        if (cat.code) categoriesMap[String(cat.code)] = cat;
      });
    } catch (e) {}

    // 1️⃣ ດຶງຂໍ້ມູນລາຍຮັບ (Incomes)
    const allIncomes = await (prisma as any).income.findMany();
    const incomes = allIncomes.filter((inc: any) => {
      if (!inc.date) return false;
      const d = new Date(inc.date);
      return !isNaN(d.getTime()) && d.getFullYear() === selectedYear;
    });

    // 2️⃣ ດຶງຂໍ້ມູນລາຍຈ່າຍ (Expenses)
    const allExpenses = await (prisma as any).expense.findMany();
    const expenses = allExpenses.filter((exp: any) => {
      if (!exp.date) return false;
      const d = new Date(exp.date);
      return !isNaN(d.getTime()) && d.getFullYear() === selectedYear;
    });

    // 3️⃣ ດຶງຂໍ້ມູນເງິນຍົກຍອດ (Annual Closing)
    let carryOverBalance = 0;
    let isClosed = false;
    
    try {
      const annualClosing = await (prisma as any).annualClosing.findFirst({
        where: { year: selectedYear - 1 }
      });
      if (annualClosing) {
        carryOverBalance = Number(annualClosing.netBalance || annualClosing.balance || annualClosing.amount || 0);
      }

      const currentYearClosing = await (prisma as any).annualClosing.findFirst({
        where: { year: selectedYear }
      });
      isClosed = !!currentYearClosing;
    } catch (e) {}

    // ຄິດໄລ່ຍອດລວມ KPI
    let totalAdminIncome = 0;
    let totalFeeIncome = 0;
    
    incomes.forEach((inc: any) => {
      const amt = Number(inc.amount || 0);
      const catId = inc.categoryId || inc.category_id || inc.catId;
      const cat = categoriesMap[String(catId)];
      const catName = cat?.name || inc.categoryName || inc.category || "";
      const catType = cat?.type || inc.type || "";
      
      if (catType.includes("FEE") || catType.includes("SERVICE") || catName.includes("ທຳນຽມ") || catName.includes("ບໍລິການ")) {
        totalFeeIncome += amt;
      } else {
        totalAdminIncome += amt;
      }
    });

    const totalIncome = totalAdminIncome + totalFeeIncome;
    const totalExpense = expenses.reduce((acc: number, curr: any) => acc + Number(curr.amount || 0), 0);
    const currentBalance = carryOverBalance + totalIncome - totalExpense;

    // 4️⃣ ຄິດໄລ່ກຣາຟ 12 ເດືອນ
    const monthNames = ["ມ.ກ", "ກ.ພ", "ມ.ນ", "ມ.ສ", "ພ.ພ", "ມ.ຖ", "ກ.ດ", "ສ.ຫ", "ກ.ຍ", "ຕ.ລ", "ພ.ຈ", "ທ.ວ"];
    const monthlyData = monthNames.map((name, index) => {
      const monthIncomes = incomes.filter((i: any) => new Date(i.date).getMonth() === index);
      const monthExpenses = expenses.filter((e: any) => new Date(e.date).getMonth() === index);

      const incSum = monthIncomes.reduce((a: number, b: any) => a + Number(b.amount || 0), 0);
      const expSum = monthExpenses.reduce((a: number, b: any) => a + Number(b.amount || 0), 0);

      return {
        name,
        income: incSum,
        expense: expSum
      };
    });

    // 5️⃣ 📥 ຈັດສັດສ່ວນລາຍຮັບ ຕາມໝວດໝູ່
    const incCatMap: { [key: string]: { name: string; value: number } } = {};
    incomes.forEach((inc: any) => {
      const catId = inc.categoryId || inc.category_id || inc.catId;
      const cat = categoriesMap[String(catId)];
      const catName = cat?.name || inc.categoryName || (typeof inc.category === 'string' ? inc.category : null) || inc.type || "ລາຍຮັບອື່ນໆ";
      const amt = Number(inc.amount || 0);
      
      if (!incCatMap[catName]) incCatMap[catName] = { name: catName, value: 0 };
      incCatMap[catName].value += amt;
    });
    const incomeCategories = Object.values(incCatMap).filter(c => c.value > 0);

    // 6️⃣ 📤 ຈັດສັດສ່ວນລາຍຈ່າຍ ຕາມໝວດໝູ່ (Smart Fallback Check)
    const expCatMap: { [key: string]: { name: string; value: number } } = {};
    expenses.forEach((exp: any) => {
      const catId = exp.categoryId || exp.category_id || exp.catId;
      const cat = categoriesMap[String(catId)];
      
      // ຄົ້ນຫາຊື່ໝວດໝູ່ຈາກທຸກ Field ທີ່ເປັນໄປໄດ້
      const catName = 
        cat?.name || 
        exp.categoryName || 
        (typeof exp.category === 'string' ? exp.category : exp.category?.name) || 
        exp.type || 
        exp.exp_type || 
        "ລາຍຈ່າຍທົ່ວໄປ";

      const amt = Number(exp.amount || exp.price || exp.total || 0);
      
      if (!expCatMap[catName]) expCatMap[catName] = { name: catName, value: 0 };
      expCatMap[catName].value += amt;
    });
    const expenseCategories = Object.values(expCatMap).filter(c => c.value > 0);

    // 7️⃣ 📦 ຈັດສັດສ່ວນຊັບສິນ ຕາມໝວດໝູ່ & ມູນຄ່າ (Smart Fallback Check)
    let assetCategories: any[] = [];
    try {
      const assets = await (prisma as any).asset.findMany();
      const assetCatMap: { [key: string]: { name: string; value: number; count: number } } = {};
      
      assets.forEach((ast: any) => {
        const catId = ast.categoryId || ast.category_id || ast.catId;
        const cat = categoriesMap[String(catId)];
        
        // ຄົ້ນຫາຊື່ໝວດໝູ່ຊັບສິນ
        const catName = 
          cat?.name || 
          ast.categoryName || 
          (typeof ast.category === 'string' ? ast.category : ast.category?.name) || 
          ast.assetType || 
          ast.asset_type || 
          ast.type || 
          "ຊັບສິນທົ່ວໄປ";

        const price = Number(ast.price || ast.value || ast.cost || ast.amount || 0);
        
        if (!assetCatMap[catName]) assetCatMap[catName] = { name: catName, value: 0, count: 0 };
        assetCatMap[catName].value += price;
        assetCatMap[catName].count += 1;
      });
      
      assetCategories = Object.values(assetCatMap).filter(c => c.value > 0 || c.count > 0);
    } catch (e) {}

    // 8️⃣ ດຶງຂໍ້ມູນຄວາມຄືບໜ້າງົບປະມານ
    let budgets: any[] = [];
    try {
      const rawBudgets = await (prisma as any).budget.findMany({ take: 5 });
      budgets = rawBudgets.map((b: any) => ({
        id: b.id,
        projectName: b.projectName || b.name || "ໂຄງການ",
        netAmount: Number(b.netAmount || b.totalAmount || b.amount || 0),
        usedAmount: Number(b.usedAmount || b.used || 0)
      }));
    } catch (e) {}

    // 9️⃣ ດຶງຂໍ້ມູນການເຄື່ອນໄຫວລ້າສຸດ
    const recentIncomes = incomes.slice(0, 5).map((i: any) => ({
      id: `inc-${i.id}`,
      type: "income",
      title: i.description || i.title || "ບັນທຶກລາຍຮັບ",
      date: new Date(i.date).toLocaleDateString("la-LA"),
      refNo: i.refNo || i.code || i.billNo || "INC-REF",
      amount: Number(i.amount || 0)
    }));

    const recentExpenses = expenses.slice(0, 5).map((e: any) => ({
      id: `exp-${e.id}`,
      type: "expense",
      title: e.description || e.title || "ບັນທຶກລາຍຈ່າຍ",
      date: new Date(e.date).toLocaleDateString("la-LA"),
      refNo: e.refNo || e.code || e.billNo || "EXP-REF",
      amount: Number(e.amount || 0)
    }));

    const recentTransactions = [...recentIncomes, ...recentExpenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);

    return NextResponse.json({
      summary: {
        currentBalance,
        totalAdminIncome,
        totalFeeIncome,
        totalExpense,
        carryOverBalance,
        isClosed
      },
      monthlyData,
      incomeCategories,
      expenseCategories,
      assetCategories,
      budgets,
      recentTransactions
    });

  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}