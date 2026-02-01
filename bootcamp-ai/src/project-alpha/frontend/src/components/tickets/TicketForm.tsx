import { useState, useEffect } from 'react';
import { Modal, Form, Input, TextArea, Select, Checkbox, Tag, Button } from '../ui';
import type { CreateTicketInput, UpdateTicketInput, Ticket } from '../../types/ticket';
import { useLabels } from '../../hooks/useLabels';
import './TicketForm.less';

interface TicketFormProps {
  ticket?: Ticket;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTicketInput | UpdateTicketInput) => void;
}

export function TicketForm({ ticket, open, onClose, onSubmit }: TicketFormProps) {
  const { data: labelsData } = useLabels();
  const labels = labelsData?.data || [];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [labelIds, setLabelIds] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      if (ticket) {
        setTitle(ticket.title);
        setDescription(ticket.description || '');
        setPriority(ticket.priority);
        setLabelIds(ticket.labels.map(l => l.id));
      } else {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setLabelIds([]);
      }
      setError('');
    }
  }, [ticket, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('请输入标题');
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description?.trim() || undefined,
      priority,
      label_ids: labelIds,
    });
    
    setTitle('');
    setDescription('');
    setPriority('medium');
    setLabelIds([]);
    setError('');
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setLabelIds([]);
    setError('');
    onClose();
  };

  const toggleLabel = (labelId: string) => {
    setLabelIds(prev => 
      prev.includes(labelId) 
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  return (
    <Modal
      title={ticket ? '编辑 Ticket' : '新建 Ticket'}
      open={open}
      onClose={handleCancel}
      width={600}
      footer={
        <>
          <Button variant="secondary" onClick={handleCancel}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {ticket ? '保存' : '创建'}
          </Button>
        </>
      }
    >
      <Form onSubmit={handleSubmit}>
        <Form.Item label="标题" error={error}>
          <Input
            placeholder="请输入 Ticket 标题"
            size="large"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError('');
            }}
          />
        </Form.Item>

        <Form.Item label="描述（可选）">
          <TextArea
            placeholder="请输入 Ticket 描述"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            showCount
            maxLength={10000}
          />
        </Form.Item>

        <Form.Item label="优先级">
          <Select
            size="large"
            value={priority}
            onChange={(value) => setPriority(value)}
            options={[
              { value: 'low', label: '低' },
              { value: 'medium', label: '中' },
              { value: 'high', label: '高' },
              { value: 'critical', label: '紧急' },
            ]}
          />
        </Form.Item>

        <Form.Item label="标签">
          <div className="apple-label-selector">
            {labels.map((label) => (
              <label key={label.id} className="apple-label-checkbox-wrapper">
                <Checkbox
                  checked={labelIds.includes(label.id)}
                  onChange={() => toggleLabel(label.id)}
                />
                <Tag color={label.color} className="apple-label-tag">
                  {label.name}
                </Tag>
              </label>
            ))}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}
