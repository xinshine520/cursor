import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketApi } from '../services/ticketApi';
import type { TicketFilters, CreateTicketInput, UpdateTicketInput, Ticket } from '../types/ticket';
import { toast } from '../lib/toast';

// 获取列表
export function useTickets(filters: TicketFilters = {}) {
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => ticketApi.getList(filters),
    staleTime: 30000,
  });
}

// 获取单个
export function useTicket(id: string) {
  return useQuery({
    queryKey: ['tickets', id],
    queryFn: () => ticketApi.getById(id),
    enabled: !!id,
  });
}

// 创建
export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ticketApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      toast({
        title: '创建成功',
        description: 'Ticket 已创建',
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
export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTicketInput }) =>
      ticketApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      toast({
        title: '更新成功',
        description: 'Ticket 已更新',
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
export function useDeleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ticketApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      toast({
        title: '删除成功',
        description: 'Ticket 已删除',
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

// 完成（乐观更新）
export function useCompleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ticketApi.complete,
    onMutate: async (ticketId) => {
      await queryClient.cancelQueries({ queryKey: ['tickets'] });
      const previousTickets = queryClient.getQueryData(['tickets']);
      
      queryClient.setQueriesData({ queryKey: ['tickets'] }, (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((ticket: Ticket) =>
            ticket.id === ticketId
              ? { ...ticket, status: 'completed' as const, completed_at: new Date().toISOString() }
              : ticket
          ),
        };
      });

      return { previousTickets };
    },
    onError: (err, ticketId, context) => {
      if (context?.previousTickets) {
        queryClient.setQueryData(['tickets'], context.previousTickets);
      }
      toast({
        title: '操作失败',
        description: '无法完成 Ticket',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

// 重新打开（乐观更新）
export function useReopenTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ticketApi.reopen,
    onMutate: async (ticketId) => {
      await queryClient.cancelQueries({ queryKey: ['tickets'] });
      const previousTickets = queryClient.getQueryData(['tickets']);

      queryClient.setQueriesData({ queryKey: ['tickets'] }, (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((ticket: Ticket) =>
            ticket.id === ticketId
              ? { ...ticket, status: 'open' as const, completed_at: null }
              : ticket
          ),
        };
      });

      return { previousTickets };
    },
    onError: (err, ticketId, context) => {
      if (context?.previousTickets) {
        queryClient.setQueryData(['tickets'], context.previousTickets);
      }
      toast({
        title: '操作失败',
        description: '无法重新打开 Ticket',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

