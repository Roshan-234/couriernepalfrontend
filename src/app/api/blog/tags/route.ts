import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("http://localhost:5000/api/blog/tags");
    if (!response.ok) {
      throw new Error("Failed to fetch tags");
    }

    const tags = await response.json();
    return NextResponse.json(tags);
  } catch (error) {
    console.error("Error fetching blog tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog tags" },
      { status: 500 }
    );
  }
}
