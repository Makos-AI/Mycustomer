"use client";

import { useState } from "react";

const TEMPLATES = [
  { id: 'waiting', label: '⏳ Waiting', message: "I'm waiting for you.", hasVariable: false },
  { id: 'late', label: '🕐 Running Late', message: "I'll be {minutes} minutes late, sorry!", hasVariable: true, prompt: 'How many minutes?', type: 'number' },
  { id: 'onway', label: '🚗 On My Way', message: "I'm on my way!", hasVariable: false },
  { id: 'almost', label: '📍 Almost There', message: 'Almost there, give me 2 minutes.', hasVariable: false },
  { id: 'change', label: '⚠️ Change of Plan', message: 'Change of plan: {reason}', hasVariable: true, prompt: 'What changed?', type: 'text' },
];

interface TemplateBarProps {
  onSend: (message: string) => void;
}

export function TemplateBar({ onSend }: TemplateBarProps) {
  const [activeTemplate, setActiveTemplate] = useState<typeof TEMPLATES[0] | null>(null);
  const [variableValue, setVariableValue] = useState('');

  const handleTemplatePress = (template: typeof TEMPLATES[0]) => {
    if (!template.hasVariable) {
      onSend(template.message);
    } else {
      setActiveTemplate(template);
      setVariableValue('');
    }
  };

  const handleConfirm = () => {
    if (!activeTemplate || !variableValue.trim()) return;
    const message = activeTemplate.message
      .replace('{minutes}', variableValue)
      .replace('{reason}', variableValue);
    onSend(message);
    setActiveTemplate(null);
    setVariableValue('');
  };

  return (
    <div>
      {activeTemplate && (
        <div className="px-3 py-2 flex gap-2 items-center animate-fade-in" style={{ borderTop: '1px solid #1f2937' }}>
          <input
            autoFocus
            type={activeTemplate.type === 'number' ? 'number' : 'text'}
            placeholder={activeTemplate.prompt}
            value={variableValue}
            onChange={e => setVariableValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleConfirm()}
            className="flex-1 rounded-xl px-3 py-2 text-sm text-white outline-none"
            style={{ background: '#1f2937', border: '1px solid #374151' }}
          />
          <button
            onClick={handleConfirm}
            disabled={!variableValue.trim()}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: '#22c55e' }}
          >Send</button>
          <button
            onClick={() => setActiveTemplate(null)}
            className="px-3 py-2 rounded-xl text-sm"
            style={{ color: '#6b7280' }}
          >✕</button>
        </div>
      )}

      <div className="flex gap-2 px-3 py-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            onClick={() => handleTemplatePress(t)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
            style={{
              background: activeTemplate?.id === t.id ? '#22c55e' : '#1f2937',
              color: activeTemplate?.id === t.id ? 'white' : '#9ca3af',
              border: '1px solid',
              borderColor: activeTemplate?.id === t.id ? '#22c55e' : '#374151',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
