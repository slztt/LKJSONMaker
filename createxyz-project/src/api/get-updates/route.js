async function handler() {
  try {
    const logs = await sql`
      SELECT id, version, date, description 
      FROM update_logs 
      ORDER BY date DESC
    `;

    return { logs };
  } catch (error) {
    return { error: "Failed to fetch update logs" };
  }
}
export async function POST(request) {
  return handler(await request.json());
}