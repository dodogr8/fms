import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs";

// PUT: ແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ດຶງ ID ຈາກ params
    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id);

    if (isNaN(userId)) {
      return NextResponse.json({ message: "ID ຜູ້ໃຊ້ບໍ່ຖືກຕ້ອງ!" }, { status: 400 });
    }

    const { username, password, fullName, role } = await request.json();

    if (!username || !fullName) {
      return NextResponse.json({ message: "ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ!" }, { status: 400 });
    }

    // ກວດສອບວ່າ Username ຊ້ຳກັບຄົນອື່ນຫຼືບໍ່
    const existingUser = await prisma.user.findFirst({
      where: {
        username,
        NOT: { id: userId },
      },
    });

    if (existingUser) {
      return NextResponse.json({ message: "ຊື່ຜູ້ໃຊ້ນີ້ຖືກນຳໃຊ້ແລ້ວ!" }, { status: 400 });
    }

    // ກຽມຂໍ້ມູນອັບເດດ
    let updateData: { username: string; fullName: string; role: string; password?: string } = {
      username,
      fullName,
      role,
    };

    // ຖ້າມີການປ້ອນ Password ໃໝ່
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Update User Error:", error);
    return NextResponse.json({ message: "ບໍ່ສາມາດແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້ໄດ້" }, { status: 500 });
  }
}

// DELETE: ລົບຜູ້ໃຊ້
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id);

    if (isNaN(userId)) {
      return NextResponse.json({ message: "ID ຜູ້ໃຊ້ບໍ່ຖືກຕ້ອງ!" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.username === "admin") {
      return NextResponse.json({ message: "ບໍ່ສາມາດລົບ ບັນຊີ Admin ຫຼັກໄດ້!" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "ລົບຜູ້ໃຊ້ງານສຳເລັດ" });
  } catch (error) {
    console.error("Delete User Error:", error);
    return NextResponse.json({ message: "ບໍ່ສາມາດລົບຜູ້ໃຊ້ໄດ້" }, { status: 500 });
  }
}