import React from 'react';
import { render, screen } from '@testing-library/react';
import StatusBadge, { formatStatusLabel } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders formatted label and classes', () => {
    render(<StatusBadge status="approved" />);

    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveTextContent('Approved');
    expect(badge.className).toMatch(/bg-emerald-100/);
  });

  it('supports in-review variants', () => {
    render(<StatusBadge status="in_review" />);
    expect(screen.getByText('In Review')).toBeInTheDocument();
  });
});

describe('formatStatusLabel', () => {
  it('converts status to title case', () => {
    expect(formatStatusLabel('in_review')).toBe('In Review');
    expect(formatStatusLabel('deprecated')).toBe('Deprecated');
  });
});
