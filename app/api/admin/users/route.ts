import { NextRequest, NextResponse } from "next/server";
import { getUsers, saveUser } from "@/lib/utils/admin-db";

export async function GET(request: NextRequest) {
  try {
    const users = await getUsers();
    return NextResponse.json(users.reverse());
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email } = body;

    if (!fullName || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await saveUser({
      fullName,
      email,
    });

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save user" }, { status: 500 });
  }
}
