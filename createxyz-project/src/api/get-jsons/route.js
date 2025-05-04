async function handler() {
  try {
    const files = await sql`
      SELECT id, name, content, created_at 
      FROM json_files 
      ORDER BY created_at DESC
    `;

    return { files };
  } catch (error) {
    return { error: "Failed to fetch JSON files" };
  }
}
export async function POST(request) {
  return handler(await request.json());
}