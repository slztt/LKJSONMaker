async function handler({ id }) {
  if (!id) {
    return { error: "Announcement ID is required" };
  }

  try {
    const result = await sql`
      DELETE FROM announcements 
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return { error: "Announcement not found" };
    }

    return { success: true };
  } catch (error) {
    return { error: "Failed to delete announcement" };
  }
}
export async function POST(request) {
  return handler(await request.json());
}