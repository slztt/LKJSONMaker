async function handler({ version, description }) {
  if (!version || !description) {
    return { error: "Version and description are required" };
  }

  try {
    const result = await sql`
      INSERT INTO update_logs (version, date, description)
      VALUES (${version}, CURRENT_DATE, ${description})
      RETURNING id, version, date, description
    `;

    return { log: result[0] };
  } catch (error) {
    return { error: "Failed to add update log" };
  }
}
export async function POST(request) {
  return handler(await request.json());
}