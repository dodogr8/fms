import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// GET: ດຶງຂໍ້ມູນໝວດໝູ່ທັງໝົດ ພ້ອມ Sub-categories
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // INCOME, EXPENSE, ASSET

    const categories = await prisma.category.findMany({
      where: {
        parentId: null, // ດຶງສະເພາະໝວດຫຼັກ
        ...(type ? { type } : {}),
      },
      include: {
        children: {
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ message: "ບໍ່ສາມາດດຶງຂໍ້ມູນໝວດໝູ່ໄດ້" }, { status: 500 });
  }
}

// POST: ເພີ່ມໝວດໝູ່ໃໝ່ (ຫຼັກ ຫຼື ຍ່ອຍ)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type, parentId } = body;

    if (!name || !type) {
      return NextResponse.json({ message: "ກະລຸນາປ້ອນຊື່ໝວດໝູ່ ແລະ ເລືອກປະເພດ" }, { status: 400 });
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        type,
        parentId: parentId ? parseInt(parentId) : null,
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "ບັນທຶກຂໍ້ມູນໝວດໝູ່ບໍ່ສຳເລັດ" }, { status: 500 });
  }
}