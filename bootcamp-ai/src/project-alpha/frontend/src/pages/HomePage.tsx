import { useState, useMemo, useCallback } from 'react';
import { Select, Pagination, Spin } from '../components/ui';
import { MainLayout } from '../components/layout/MainLayout';
import { TicketCard } from '../components/tickets/TicketCard';
import { TicketForm } from '../components/tickets/TicketForm';
import { TicketSearch } from '../components/tickets/TicketSearch';
import { useTickets, useCreateTicket, useUpdateTicket, useDeleteTicket, useCompleteTicket, useReopenTicket } from '../hooks/useTickets';
import { useDebounce } from '../hooks/useDebounce';
import type { Ticket, TicketStatus, TicketFilters } from '../types/ticket';
import { LabelForm } from '../components/labels/LabelForm';
import type { Label } from '../types/label';
import { TicketListSkeleton } from '../components/tickets/TicketListSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { useCreateLabel, useUpdateLabel } from '../hooks/useLabels';
import './HomePage.less';

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | TicketStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const [isCreateLabelOpen, setIsCreateLabelOpen] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const ticketFilters = useMemo<TicketFilters>(() => ({
    title: debouncedSearch || undefined,
    status: statusFilter,
    priority: priorityFilter,
    label_ids: selectedLabelIds.length > 0 ? selectedLabelIds : undefined,
    no_label: selectedLabelIds.length === 0 && statusFilter === 'all' ? undefined : false,
    page: currentPage,
    page_size: 20,
  }), [debouncedSearch, statusFilter, priorityFilter, selectedLabelIds, currentPage]);

  const { data: ticketsData, isLoading } = useTickets(ticketFilters);

  const createMutation = useCreateTicket();
  const updateMutation = useUpdateTicket();
  const deleteMutation = useDeleteTicket();
  const completeMutation = useCompleteTicket();
  const reopenMutation = useReopenTicket();

  const handleLabelSelect = useCallback((labelId: string | null) => {
    setCurrentPage(1); // Reset page on filter change
    if (labelId === null) {
      setSelectedLabelIds([]);
    } else {
      setSelectedLabelIds([labelId]);
    }
  }, []);

  const handleCreateTicket = useCallback((data: any) => {
    createMutation.mutate(data);
    setIsCreateFormOpen(false);
  }, [createMutation]);

  const handleUpdateTicket = useCallback((data: any) => {
    if (editingTicket) {
      updateMutation.mutate({ id: editingTicket.id, data });
      setEditingTicket(null);
    }
  }, [editingTicket, updateMutation]);

  const handleDeleteTicket = useCallback((ticket: Ticket) => {
    if (confirm(`确定要删除 "${ticket.title}" 吗？此操作不可撤销。`)) {
      deleteMutation.mutate(ticket.id);
    }
  }, [deleteMutation]);

  const createLabelMutation = useCreateLabel();
  const updateLabelMutation = useUpdateLabel();

  const handleCreateLabel = useCallback(() => {
    setIsCreateLabelOpen(true);
  }, []);

  const handleLabelSubmit = useCallback((data: any) => {
    if (editingLabel) {
      updateLabelMutation.mutate({ id: editingLabel.id, data });
      setEditingLabel(null);
    } else {
      createLabelMutation.mutate(data);
      setIsCreateLabelOpen(false);
    }
  }, [editingLabel, updateLabelMutation, createLabelMutation]);

  const tickets = useMemo(() => ticketsData?.data || [], [ticketsData?.data]);
  const hasTickets = tickets.length > 0;

  const statusOptions = useMemo(() => [
    { value: 'all', label: '全部状态' },
    { value: 'open', label: '进行中' },
    { value: 'completed', label: '已完成' },
  ], []);

  const priorityOptions = useMemo(() => [
    { value: 'low', label: '低' },
    { value: 'medium', label: '中' },
    { value: 'high', label: '高' },
    { value: 'critical', label: '紧急' },
  ], []);

  const handleStatusChange = useCallback((value: string) => {
    setStatusFilter(value as 'all' | TicketStatus);
    setCurrentPage(1);
  }, []);

  const handlePriorityChange = useCallback((value: string) => {
    setPriorityFilter(value || undefined);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const emptyStateDescription = useMemo(() => {
    return searchQuery || selectedLabelIds.length > 0 || statusFilter !== 'all' || priorityFilter
      ? "没有找到匹配的 Ticket，请尝试调整筛选条件。"
      : "创建你的第一个 Ticket 开始使用。";
  }, [searchQuery, selectedLabelIds.length, statusFilter, priorityFilter]);

  const handleOpenCreateForm = useCallback(() => {
    setIsCreateFormOpen(true);
  }, []);

  const handleCloseCreateForm = useCallback(() => {
    setIsCreateFormOpen(false);
  }, []);

  const handleCloseEditForm = useCallback(() => {
    setEditingTicket(null);
  }, []);

  const handleCloseLabelForm = useCallback(() => {
    setIsCreateLabelOpen(false);
    setEditingLabel(null);
  }, []);

  return (
    <MainLayout
      selectedLabelIds={selectedLabelIds}
      onLabelSelect={handleLabelSelect}
      onCreateTicket={handleOpenCreateForm}
      onCreateLabel={handleCreateLabel}
    >
      <div className="apple-homepage-container">
        <div className="apple-search-filters">
          <div className="apple-search-wrapper">
            <TicketSearch value={searchQuery} onChange={setSearchQuery} />
          </div>
          <div className="apple-filters">
            <Select
              value={statusFilter}
              onChange={handleStatusChange}
              size="large"
              className="apple-filter-select"
              options={statusOptions}
            />
            <Select
              value={priorityFilter || ''}
              onChange={handlePriorityChange}
              placeholder="优先级"
              allowClear
              size="large"
              className="apple-filter-select"
              options={priorityOptions}
            />
          </div>
        </div>

        <Spin spinning={isLoading}>
          {!hasTickets && !isLoading ? (
            <EmptyState
              title="暂无 Ticket"
              description={emptyStateDescription}
              actionLabel="新建 Ticket"
              onAction={handleOpenCreateForm}
            />
          ) : (
            <div className="apple-tickets-grid">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="apple-ticket-col">
                  <TicketCard
                    ticket={ticket}
                    onComplete={completeMutation.mutate}
                    onReopen={reopenMutation.mutate}
                    onEdit={setEditingTicket}
                    onDelete={handleDeleteTicket}
                  />
                </div>
              ))}
            </div>
          )}
        </Spin>

        {ticketsData?.pagination && ticketsData.pagination.total_pages > 1 && (
          <div className="apple-pagination-wrapper">
              <Pagination
                current={ticketsData.pagination.page}
                total={ticketsData.pagination.total}
                pageSize={ticketsData.pagination.page_size}
                onChange={handlePageChange}
                showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`}
                className="apple-pagination"
              />
          </div>
        )}
      </div>

      <TicketForm
        open={isCreateFormOpen}
        onClose={handleCloseCreateForm}
        onSubmit={handleCreateTicket}
      />

      <TicketForm
        ticket={editingTicket || undefined}
        open={!!editingTicket}
        onClose={handleCloseEditForm}
        onSubmit={handleUpdateTicket}
      />

      <LabelForm
        label={editingLabel || undefined}
        open={isCreateLabelOpen || !!editingLabel}
        onClose={handleCloseLabelForm}
        onSubmit={handleLabelSubmit}
      />
    </MainLayout>
  );
}

