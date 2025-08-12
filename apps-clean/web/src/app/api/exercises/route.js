import sql from "../utils/sql.js";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const species = url.searchParams.get("species") || "1";
    const difficulty = url.searchParams.get("difficulty");

    let query = "SELECT * FROM exercises WHERE species_type = $1";
    let params = [parseInt(species)];

    if (difficulty) {
      query += " AND difficulty_level = $2";
      params.push(difficulty);
    }

    query += " ORDER BY id";

    const exercises = await sql(query, params);

    return Response.json({
      success: true,
      exercises: exercises.map((ex) => ({
        ...ex,
        cantus_firmus:
          typeof ex.cantus_firmus === "string"
            ? JSON.parse(ex.cantus_firmus)
            : ex.cantus_firmus,
      })),
    });
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch exercises",
      },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      species_type,
      difficulty_level,
      cantus_firmus,
      title,
      description,
    } = body;

    if (!species_type || !cantus_firmus) {
      return Response.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO exercises (species_type, difficulty_level, cantus_firmus, title, description)
      VALUES (${species_type}, ${difficulty_level || "beginner"}, ${JSON.stringify(cantus_firmus)}, ${title}, ${description})
      RETURNING *
    `;

    return Response.json({
      success: true,
      exercise: {
        ...result[0],
        cantus_firmus: JSON.parse(result[0].cantus_firmus),
      },
    });
  } catch (error) {
    console.error("Error creating exercise:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to create exercise",
      },
      { status: 500 },
    );
  }
}
