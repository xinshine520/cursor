import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labelApi } from '../services/labelApi';
import type { CreateLabelInput, UpdateLabelInput } from '../types/label';
import { toast } from '../lib/toast';

// 获取列表
export function useLabels() {
  return useQuery({
    queryKey: ['labels'],
    queryFn: () => labelApi.getList({ with_count: true }),
    staleTime: 60000, // 标签变化较少，1分钟
  });
}

// 创建
export function useCreateLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: labelApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      toast({
        title: '创建成功',
        description: '标签已创建',
      });
    },
    onError: (error: any) => {
      toast({
        title: '创建失败',
        description: error.response?.data?.detail || error.message || '发生错误',
        variant: 'destructive',
      });
    },
  });
}

// 更新
export function useUpdateLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLabelInput }) =>
      labelApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      toast({
        title: '更新成功',
        description: '标签已更新',
      });
    },
    onError: (error: any) => {
      toast({
        title: '更新失败',
        description: error.response?.data?.detail || error.message || '发生错误',
        variant: 'destructive',
      });
    },
  });
}

// 删除
export function useDeleteLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: labelApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast({
        title: '删除成功',
        description: '标签已删除',
      });
    },
    onError: (error: any) => {
      toast({
        title: '删除失败',
        description: error.response?.data?.detail || error.message || '发生错误',
        variant: 'destructive',
      });
    },
  });
}

