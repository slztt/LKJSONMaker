async function handler({ name, content }) {
  try {
    // Parse the input JSON
    let jsonContent = JSON.parse(content);

    // Add version and items if they don't exist
    if (!jsonContent.version) {
      jsonContent = {
        version: 1,
        ...jsonContent,
      };
    }

    if (!jsonContent.items && Array.isArray(jsonContent)) {
      jsonContent = {
        version: 1,
        items: jsonContent,
      };
    }

    // Convert back to string with proper formatting
    const formattedContent = JSON.stringify(jsonContent, null, 2);

    const result = await sql`
      INSERT INTO json_files (name, content)
      VALUES (${name}, ${formattedContent})
      RETURNING id, name, content, created_at
    `;

    return result[0];
  } catch (error) {
    console.error("Error saving JSON:", error);
    return {
      error: "Failed to save JSON file. Please ensure valid JSON format.",
    };
  }
}
export async function POST(request) {
  return handler(await request.json());
}