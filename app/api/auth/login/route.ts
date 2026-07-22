import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້ ແລະ ລະຫັດຜ່ານ!" },
        { status: 400 }
      );
    }

    // ຄົ້ນຫາຜູ້ໃຊ້ໃນ Database
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json(
        { message: "ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານ ບໍ່ຖືກຕ້ອງ!" },
        { status: 401 }
      );
    }

    // ກວດສອບລະຫັດຜ່ານ ( Compare Hash Password )
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // ສຳລັບການທົດສອບ (ຖ້າລະຫັດໃນ DB ຍັງບໍ່ໄດ້ Hash ໃຫ້ເຊັກແບບ plain text ນຳ)
    const isPlainTextValid = password === user.password;

    if (!isPasswordValid && !isPlainTextValid) {
      return NextResponse.json(
        { message: "ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານ ບໍ່ຖືກຕ້ອງ!" },
        { status: 401 }
      );
    }

    // ສົ່ງຂໍ້ມູນຜູ້ໃຊ້າກັບໄປ (ໂດຍບໍ່ສົ່ງ password)
    return NextResponse.json({
      message: "ເຂົ້າສູ່ລະບົບສຳເລັດ!",
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { message: "ເກີດຂໍ້ຜິດພາດໃນລະບົບ ບໍ່ສາມາດເຂົ້າສູ່ລະບົບໄດ້!" },
      { status: 500 }
    );
  }
}