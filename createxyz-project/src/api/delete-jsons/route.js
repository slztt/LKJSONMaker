async function handler({ ids }) {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return { error: "Valid array of IDs is required" };
  }

  try {
    const result = await sql`
      DELETE FROM json_files 
      WHERE id = ANY(${ids})
      RETURNING id
    `;

    if (result.length === 0) {
      return { error: "No files found with the provided IDs" };
    }

    return {
      success: true,
      deletedCount: result.length,
    };
  } catch (error) {
    return { error: "Failed to delete JSON files" };
  }
}
export async function POST(request) {
  return handler(await request.json());
}