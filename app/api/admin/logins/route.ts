import { NextRequest, NextResponse } from "next/server";
import { getLoginLogs, addLoginLog, clearLoginLogs } from "@/lib/utils/admin-db";

export async function GET(request: NextRequest) {
  try {
    const logs = await getLoginLogs();
    // Return latest logs first
    return NextResponse.json(logs.reverse());
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch logs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, status, role, error } = body;

    if (!email || !status || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userAgent = request.headers.get("user-agent") || "Unknown";
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

    const log = await addLoginLog({
      email,
      status,
      role,
      userAgent,
      ip,
      error,
    });

    return NextResponse.json(log);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to log event" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const success = await clearLoginLogs();
    if (success) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Failed to clear logs" }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to clear logs" }, { status: 500 });
  }
}
