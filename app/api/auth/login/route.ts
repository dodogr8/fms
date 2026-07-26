import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
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

    // 1️⃣ ຄົ້ນຫາຜູ້ໃຊ້ໃນ Database
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json(
        { message: "ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານ ບໍ່ຖືກຕ້ອງ!" },
        { status: 401 }
      );
    }

    // 2️⃣ ກວດສອບລະຫັດຜ່ານ
    const isPasswordValid = await bcrypt.compare(password, user.password);
    const isPlainTextValid = password === user.password; // ສຳລັບ plain text password ຕອນ test

    if (!isPasswordValid && !isPlainTextValid) {
      return NextResponse.json(
        { message: "ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານ ບໍ່ຖືກຕ້ອງ!" },
        { status: 401 }
      );
    }

    // 3️⃣ ປະກາດ Token (ປະກາດຕົວປ່ຽນ userToken ໃຫ້ຈະແຈ້ງ)
    const userToken = String(user.id || user.username);

    // 4️⃣ ສ້າງ Response ພ້ອມຂໍ້ມູນຜູ້ໃຊ້
    const userData = {
      id: user.id,
      username: user.username,
      fullName: user.fullName || user.username,
      role: user.role || "FINANCE_STAFF",
    };

    const response = NextResponse.json({
      message: "ເຂົ້າສູ່ລະບົບສຳເລັດ",
      user: userData,
      token: userToken,
    });

    // 5️⃣ Set Cookie (ກຳນົດອາຍຸ 7 ວັນ)
    response.cookies.set("token", userToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 ວັນ
    });

    return response;

  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { message: "ເກີດຂໍ້ຜິດພາດໃນລະບົບ!" },
      { status: 500 }
    );
  }
}