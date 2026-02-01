import api from './api';
import type {
  Label,
  CreateLabelInput,
  UpdateLabelInput,
  LabelsResponse,
} from '../types/label';

export const labelApi = {
  // 获取列表
  getList: async (params: { with_count?: boolean; sort_by?: string } = {}): Promise<LabelsResponse> => {
    const searchParams = new URLSearchParams();
    if (params.with_count !== undefined) searchParams.append('with_count', params.with_count.toString());
    if (params.sort_by) searchParams.append('sort_by', params.sort_by);
    
    return api.get(`/labels?${searchParams.toString()}`);
  },

  // 获取单个
  getById: async (id: string): Promise<Label> => {
    return api.get(`/labels/${id}`);
  },

  // 创建
  create: async (data: CreateLabelInput): Promise<Label> => {
    return api.post('/labels', data);
  },

  // 更新
  update: async (id: string, data: UpdateLabelInput): Promise<Label> => {
    return api.put(`/labels/${id}`, data);
  },

  // 删除
  delete: async (id: string): Promise<void> => {
    return api.delete(`/labels/${id}`);
  },
};

