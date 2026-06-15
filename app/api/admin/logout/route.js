import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { isAuthenticated } from "@/lib/auth"

export async function POST() {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const cookieStore = await cookies()
    cookieStore.delete("admin_token")
    cookieStore.delete("csrf_token")
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
