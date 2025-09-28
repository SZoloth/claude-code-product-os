import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ModelingInterface from '../modeling-interface';

describe('ModelingInterface', () => {
  it('renders the modeling asset grid layout', () => {
    render(<ModelingInterface />);

    expect(screen.getAllByRole('main').length).toBeGreaterThan(0);
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.getAllByText('Asset 1').length).toBeGreaterThan(0);
  });
});
