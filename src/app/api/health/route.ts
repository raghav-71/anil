import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const uptime = process.uptime();
  const timestamp = new Date().toISOString();

  // Return minimal safe health payload without exposing internal secrets
  return NextResponse.json(
    {
      status: "healthy",
      service: "anil-communications-backend",
      region: process.env.AWS_REGION || "ap-south-1",
      timestamp,
      uptimeSeconds: Math.floor(uptime),
      environment: process.env.NODE_ENV || "production",
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Content-Type": "application/json",
      },
    }
  );
}

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

