import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: ດຶງຂໍ້ມູນຊັບສິນທັງໝົດ
export async function GET() {
  try {
    const assets = await prisma.asset.findMany({
      orderBy: { id: "desc" },
    });
    return NextResponse.json(assets);
  } catch (error) {
    return NextResponse.json({ message: "ບໍ່ສາມາດດຶງຂໍ້ມູນຊັບສິນໄດ້" }, { status: 500 });
  }
}

// POST: ບັນທຶກຊັບສິນໃໝ່
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { assetCode, name, categoryName, purchaseDate, price, assignedTo, status, attachment } = body;

    if (!name || !price) {
      return NextResponse.json({ message: "ກະລຸນາປ້ອນຂໍ້ມູນຊື່ຊັບສິນ ແລະ ມູນຄ່າ" }, { status: 400 });
    }

    const code = assetCode || `AST-${Date.now().toString().slice(-4)}`;

    const newAsset = await prisma.asset.create({
      data: {
        assetCode: code,
        name,
        categoryName: categoryName || "ອຸປະກອນ IT",
        purchaseDate: purchaseDate || new Date().toISOString().split("T")[0],
        price: parseFloat(price),
        assignedTo: assignedTo || "ຍັງບໍ່ມີຜູ້ຮັບຜິດຊອບ",
        status: status || "available",
        attachment: attachment || null, // ບັນທຶກຊື່ໄຟລ໌
      },
    });

    return NextResponse.json(newAsset, { status: 201 });
  } catch (error) {
    console.error("Asset Post Error:", error);
    return NextResponse.json({ message: "ບັນທຶກຂໍ້ມູນຊັບສິນບໍ່ສຳເລັດ" }, { status: 500 });
  }
}