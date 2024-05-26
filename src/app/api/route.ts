import { NextRequest, NextResponse } from "next/server";

const GET = (request: NextRequest) => {
  return NextResponse.json({ message: "hello world" }, { status: 200 });
};

export { GET };
