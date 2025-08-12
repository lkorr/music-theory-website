import sql from "../../utils/sql.js";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return Response.json(
        {
          success: false,
          error: "Invalid exercise ID",
        },
        { status: 400 },
      );
    }

    const exercises = await sql("SELECT * FROM exercises WHERE id = $1", [
      parseInt(id),
    ]);

    if (exercises.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Exercise not found",
        },
        { status: 404 },
      );
    }

    const exercise = exercises[0];

    // Get rules for this species type
    const rules = await sql(
      "SELECT rule_text, rule_order FROM species_rules WHERE species_type = $1 AND is_active = true ORDER BY rule_order",
      [exercise.species_type],
    );

    return Response.json({
      success: true,
      exercise: {
        ...exercise,
        cantus_firmus:
          typeof exercise.cantus_firmus === "string"
            ? JSON.parse(exercise.cantus_firmus)
            : exercise.cantus_firmus,
        rules: rules.map((r) => r.rule_text),
      },
    });
  } catch (error) {
    console.error("Error fetching exercise:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch exercise",
      },
      { status: 500 },
    );
  }
}
