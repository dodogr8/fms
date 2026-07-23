import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT: ແກ້ໄຂໝວດໝູ່
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const categoryId = parseInt(resolvedParams.id);
    const body = await request.json();

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: body.name,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "ບໍ່ສາມາດແກ້ໄຂໝວດໝູ່ໄດ້" }, { status: 500 });
  }
}

// DELETE: ລົບໝວດໝູ່ (ລົບໝວດຫຼັກ ຈະລົບໝວດຍ່ອຍນຳອັດຕະໂນມັດ)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const categoryId = parseInt(resolvedParams.id);

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({ message: "ລົບໝວດໝູ່ສຳເລັດ" });
  } catch (error) {
    return NextResponse.json({ message: "ບໍ່ສາມາດລົບໝວດໝູ່ໄດ້" }, { status: 500 });
  }
}