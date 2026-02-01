import api from './api';
import type {
  Ticket,
  CreateTicketInput,
  UpdateTicketInput,
  TicketFilters,
  PaginatedTicketsResponse,
} from '../types/ticket';

export const ticketApi = {
  // 获取列表
  getList: async (filters: TicketFilters = {}): Promise<PaginatedTicketsResponse> => {
    const params = new URLSearchParams();
    
    if (filters.title) params.append('title', filters.title);
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.label_ids?.length) params.append('label_ids', filters.label_ids.join(','));
    if (filters.no_label) params.append('no_label', 'true');
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_order) params.append('sort_order', filters.sort_order);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.page_size) params.append('page_size', filters.page_size.toString());
    
    return api.get(`/tickets?${params.toString()}`);
  },

  // 获取单个
  getById: async (id: string): Promise<Ticket> => {
    return api.get(`/tickets/${id}`);
  },

  // 创建
  create: async (data: CreateTicketInput): Promise<Ticket> => {
    return api.post('/tickets', data);
  },

  // 更新
  update: async (id: string, data: UpdateTicketInput): Promise<Ticket> => {
    return api.put(`/tickets/${id}`, data);
  },

  // 删除
  delete: async (id: string): Promise<void> => {
    return api.delete(`/tickets/${id}`);
  },

  // 完成
  complete: async (id: string): Promise<Ticket> => {
    return api.patch(`/tickets/${id}/complete`);
  },

  // 重新打开
  reopen: async (id: string): Promise<Ticket> => {
    return api.patch(`/tickets/${id}/reopen`);
  },
};

