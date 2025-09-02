export interface FuxExercise {
  id: string;
  species_type: string;
  difficulty_level: string;
  title: string;
  figure: number;
  modalFinal: number;
  measureCount: number;
  cantus: Array<{
    note: number;
    beat: number;
    duration: number;
  }>;
}

declare const exercises: FuxExercise[];
export default exercises;