import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";

// GET: ດຶງຂໍ້ມູນຜູ້ໃຊ້ທັງໝົດ
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
      orderBy: { id: "asc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ message: "ບໍ່ສາມາດດຶງຂໍ້ມູນຜູ້ໃຊ້ໄດ້" }, { status: 500 });
  }
}

// POST: ເພີ່ມຜູ້ໃຊ້ໃໝ່
export async function POST(request: Request) {
  try {
    const { username, password, fullName, role } = await request.json();

    if (!username || !password || !fullName) {
      return NextResponse.json({ message: "ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ" }, { status: 400 });
    }

    // ກວດສອບຊື່ຜູ້ໃຊ້ຊ້ຳ
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json({ message: "ຊື່ຜູ້ໃຊ້ນີ້ມີໃນລະບົບແລ້ວ!" }, { status: 400 });
    }

    // ເຂົ້າລະຫັດ Password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        fullName,
        role: role || "FINANCE_STAFF",
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມຜູ້ໃຊ້" }, { status: 500 });
  }
}