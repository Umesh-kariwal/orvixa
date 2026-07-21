import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Heading } from '@/components/ui/Typography';
import { ArrowUpDown } from 'lucide-react';
import type { RendererComponentProps } from '../core/types';

export const ComparisonTableRenderer: React.FC<RendererComponentProps> = ({ payload }) => {
  const headers: string[] = payload.structured_data?.headers || ['Feature / Option', 'Current Code', 'Recommended Fix'];
  const initialRows: string[][] = payload.structured_data?.rows || [
    ['Time Complexity', 'O(N^2) Nested Loop', 'O(N) Hash Map Lookup'],
    ['Space Complexity', 'O(1) Auxiliary', 'O(N) Memory Buffer'],
    ['Null Safety', 'Unchecked Pointer', 'Guarded Null Coalescing'],
  ];

  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const handleSort = (colIdx: number) => {
    if (sortCol === colIdx) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(colIdx);
      setSortAsc(true);
    }
  };

  const sortedRows = [...initialRows].sort((a, b) => {
    if (sortCol === null) return 0;
    const valA = a[sortCol] || '';
    const valB = b[sortCol] || '';
    return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  return (
    <Card variant="glass">
      <Heading level={3} style={{ marginBottom: '12px' }}>
        {payload.summary || 'Technical Comparison Table'}
      </Heading>

      <div style={{ overflowX: 'auto', maxHeight: '300px' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-sans)',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-color)' }}>
              {headers.map((h, idx) => (
                <th
                  key={idx}
                  onClick={() => handleSort(idx)}
                  style={{
                    padding: '8px 12px',
                    textAlign: 'left',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {h} <ArrowUpDown size={12} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, rIdx) => (
              <tr
                key={rIdx}
                style={{
                  borderBottom: '1px solid var(--border-color)',
                  backgroundColor: rIdx % 2 === 0 ? 'transparent' : 'var(--bg-primary)',
                }}
              >
                {row.map((cell, cIdx) => (
                  <td key={cIdx} style={{ padding: '8px 12px', color: 'var(--text-primary)' }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
