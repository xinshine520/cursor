import { useState, useEffect } from 'react';
import { Modal, Form, Input, TextArea, ColorPicker, Button } from '../ui';
import type { CreateLabelInput, UpdateLabelInput, Label } from '../../types/label';
import './LabelForm.less';

interface LabelFormProps {
  label?: Label;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLabelInput | UpdateLabelInput) => void;
}

const DEFAULT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b',
  '#10b981', '#3b82f6', '#06b6d4', '#84cc16', '#f97316'
];

export function LabelForm({ label, open, onClose, onSubmit }: LabelFormProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      if (label) {
        setName(label.name);
        setColor(label.color || '#6366f1');
        setDescription(label.description || '');
      } else {
        setName('');
        setColor('#6366f1');
        setDescription('');
      }
      setError('');
    }
  }, [label, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('请输入标签名称');
      return;
    }

    onSubmit({
      name: name.trim(),
      color,
      description: description?.trim() || undefined,
    });
    
    setName('');
    setColor('#6366f1');
    setDescription('');
    setError('');
    onClose();
  };

  const handleCancel = () => {
    setName('');
    setColor('#6366f1');
    setDescription('');
    setError('');
    onClose();
  };

  return (
    <Modal
      title={label ? '编辑标签' : '新建标签'}
      open={open}
      onClose={handleCancel}
      width={500}
      footer={
        <>
          <Button variant="secondary" onClick={handleCancel}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {label ? '保存' : '创建'}
          </Button>
        </>
      }
    >
      <Form onSubmit={handleSubmit}>
        <Form.Item label="名称" error={error}>
          <Input
            placeholder="请输入标签名称"
            size="large"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            maxLength={50}
          />
        </Form.Item>

        <Form.Item label="颜色">
          <div className="apple-color-selector">
            <ColorPicker
              value={color}
              onChange={(newColor) => setColor(newColor)}
            />
            <div className="apple-color-presets">
              {DEFAULT_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => setColor(presetColor)}
                  className={`apple-color-preset ${color === presetColor ? 'apple-color-preset-active' : ''}`}
                  style={{ backgroundColor: presetColor }}
                  aria-label={`选择颜色 ${presetColor}`}
                />
              ))}
            </div>
          </div>
        </Form.Item>

        <Form.Item label="描述（可选）">
          <TextArea
            placeholder="请输入标签描述"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            showCount
            maxLength={200}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
