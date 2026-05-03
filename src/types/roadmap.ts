export interface StageResponse {
  id: number;
  order_number: number;
  title: string;
  description: string;
  unlock_quiz_score: number;
  unlock_exercise_completion: number;
  unlocked: boolean;
  completed: boolean;
}

export interface RoleRoadmapResponse {
  role_id: number;
  role_name: string;
  stages: StageResponse[];
}
