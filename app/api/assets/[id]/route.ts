import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

// PUT: ແກ້ໄຂຊັບສິນ
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const assetId = parseInt(resolvedParams.id);
    const body = await request.json();

    const updatedAsset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        assetCode: body.assetCode,
        name: body.name,
        categoryName: body.categoryName,
        purchaseDate: body.purchaseDate,
        price: parseFloat(body.price),
        assignedTo: body.assignedTo,
        status: body.status,
        attachment: body.attachment || null,
      },
    });

    return NextResponse.json(updatedAsset);
  } catch (error) {
    return NextResponse.json({ message: "ບໍ່ສາມາດແກ້ໄຂຂໍ້ມູນໄດ້" }, { status: 500 });
  }
}

// DELETE: ລົບຊັບສິນ 1 ລາຍການ
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const assetId = parseInt(resolvedParams.id);

    await prisma.asset.delete({
      where: { id: assetId },
    });

    return NextResponse.json({ message: "ລົບຂໍ້ມູນສຳເລັດ" });
  } catch (error) {
    return NextResponse.json({ message: "ບໍ່ສາມາດລົບຂໍ້ມູນໄດ້" }, { status: 500 });
  }
}