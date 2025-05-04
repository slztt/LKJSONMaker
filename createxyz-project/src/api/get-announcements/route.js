async function handler() {
  try {
    const announcements = await sql`
      SELECT id, message, created_at 
      FROM announcements 
      ORDER BY created_at DESC
    `;

    return { announcements };
  } catch (error) {
    return { error: "Failed to fetch announcements" };
  }
}
export async function POST(request) {
  return handler(await request.json());
}