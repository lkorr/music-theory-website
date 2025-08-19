import sql from "../utils/sql.js";
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || 'your-secret-key');

/**
 * Verify authentication token from cookie
 */
async function verifyAuth(request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(';');
    let token = null;
    
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth-token') {
        token = value;
        break;
      }
    }

    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: 'midi-training-app',
      audience: 'midi-training-app-users'
    });

    return payload;
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

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
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return Response.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    // Check if user has permission to create exercises (admin or teacher role)
    if (!['admin', 'teacher'].includes(user.role)) {
      return Response.json(
        {
          success: false,
          error: "Insufficient permissions to create exercises",
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      species_type,
      difficulty_level,
      cantus_firmus,
      title,
      description,
    } = body;

    // Input validation
    if (!species_type || !cantus_firmus) {
      return Response.json(
        {
          success: false,
          error: "Missing required fields: species_type and cantus_firmus",
        },
        { status: 400 },
      );
    }

    // Validate species_type
    if (![1, 2, 3, 4, 5].includes(parseInt(species_type))) {
      return Response.json(
        {
          success: false,
          error: "species_type must be between 1 and 5",
        },
        { status: 400 },
      );
    }

    // Validate cantus_firmus is an array
    if (!Array.isArray(cantus_firmus)) {
      return Response.json(
        {
          success: false,
          error: "cantus_firmus must be an array",
        },
        { status: 400 },
      );
    }

    // Validate MIDI notes in cantus_firmus
    for (const note of cantus_firmus) {
      if (typeof note.note !== 'number' || note.note < 0 || note.note > 127) {
        return Response.json(
          {
            success: false,
            error: "Invalid MIDI note values (must be 0-127)",
          },
          { status: 400 },
        );
      }
    }

    // Validate title and description length
    if (title && title.length > 100) {
      return Response.json(
        {
          success: false,
          error: "Title must be 100 characters or less",
        },
        { status: 400 },
      );
    }

    if (description && description.length > 500) {
      return Response.json(
        {
          success: false,
          error: "Description must be 500 characters or less",
        },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO exercises (species_type, difficulty_level, cantus_firmus, title, description, created_by)
      VALUES (${parseInt(species_type)}, ${difficulty_level || "beginner"}, ${JSON.stringify(cantus_firmus)}, ${title || null}, ${description || null}, ${user.userId})
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
