import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: 'ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານ ບໍ່ຖືກຕ້ອງ' }, { status: 401 });
    }

    // 💡 ເຂົ້າລະຫັດ Payload Token
    const sessionData = JSON.stringify({
      id: user.id,
      username: user.username,
      role: user.role,
      exp: Date.now() + 24 * 60 * 60 * 1000, // 1 ວັນ
    });
    const token = Buffer.from(sessionData).toString('base64');

    const response = NextResponse.json({
      message: 'ເຂົ້າສູ່ລະບົບ ສຳເລັດ',
      user: { id: user.id, username: user.username, role: user.role },
    });

    // ຕັ້ງຄ່າ Secure Cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 1 ວັນ
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}