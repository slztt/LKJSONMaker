async function handler({ password }) {
  if (!password) {
    return { error: "Password is required" };
  }

  try {
    const result = await sql`
      SELECT id FROM admin_credentials 
      WHERE password = ${password} 
      LIMIT 1
    `;

    return {
      isValid: result.length > 0,
    };
  } catch (error) {
    return { error: "Failed to verify password" };
  }
}
export async function POST(request) {
  return handler(await request.json());
}