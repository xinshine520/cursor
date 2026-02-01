export interface Label {
  id: string;
  name: string;
  color: string;
  description?: string | null;
  ticket_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateLabelInput {
  name: string;
  color?: string;
  description?: string;
}

export interface UpdateLabelInput {
  name?: string;
  color?: string;
  description?: string;
}

export interface LabelsResponse {
  data: Label[];
  total: number;
}

