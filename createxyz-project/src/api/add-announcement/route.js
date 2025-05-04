async function handler({ message }) {
  if (!message) {
    return { error: "Message is required" };
  }

  try {
    const result = await sql`
      INSERT INTO announcements (message)
      VALUES (${message})
      RETURNING id, message, created_at
    `;

    return { announcement: result[0] };
  } catch (error) {
    return { error: "Failed to add announcement" };
  }
}
export async function POST(request) {
  return handler(await request.json());
}