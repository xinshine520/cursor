export const TICKET_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
export const TICKET_STATUSES = ['open', 'completed'] as const;

export type TicketPriority = typeof TICKET_PRIORITIES[number];
export type TicketStatus = typeof TICKET_STATUSES[number];

export interface Label {
  id: string;
  name: string;
  color: string;
  description?: string | null;
}

export interface Ticket {
  id: string;
  title: string;
  description?: string | null;
  priority: TicketPriority;
  status: TicketStatus;
  labels: Label[];
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
}

export interface CreateTicketInput {
  title: string;
  description?: string;
  priority?: TicketPriority;
  label_ids?: string[];
}

export interface UpdateTicketInput {
  title?: string;
  description?: string;
  priority?: TicketPriority;
  label_ids?: string[];
}

export interface TicketFilters {
  title?: string;
  status?: 'all' | TicketStatus;
  priority?: TicketPriority;
  label_ids?: string[];
  no_label?: boolean;
  sort_by?: 'created_at' | 'updated_at' | 'priority';
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PaginatedTicketsResponse {
  data: Ticket[];
  pagination: PaginationMeta;
}
