import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AssetGrid, { getColumnCount } from '../components/AssetGrid';

type GridProps = {
  columnCount: number;
  rowCount: number;
  itemData: any;
  children: ({ columnIndex, rowIndex, style, data }: any) => React.ReactNode;
};

const gridRenderLog: Array<{ columnCount: number }> = [];
const sampleAssets = Array.from({ length: 24 }, (_, i) => ({
  id: `asset-${i + 1}`,
  name: `Asset ${i + 1}`,
  imageUrl: `https://example.com/${i + 1}.png`,
  status: (i % 3 === 0 ? 'approved' : i % 3 === 1 ? 'in_review' : 'draft') as const,
}));

jest.mock('react-window', () => {
  const FixedSizeGrid = jest.fn(({ columnCount, rowCount, itemData, children }: GridProps) => {
    gridRenderLog.push({ columnCount });
    const items: React.ReactNode[] = [];
    const rowsToRender = Math.min(rowCount, 1);

    for (let rowIndex = 0; rowIndex < rowsToRender; rowIndex += 1) {
      for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
        items.push(children({ rowIndex, columnIndex, style: {}, data: itemData }));
      }
    }

    return <div data-testid="grid">{items}</div>;
  });

  return { FixedSizeGrid };
});

const { FixedSizeGrid } = jest.requireMock('react-window') as {
  FixedSizeGrid: jest.Mock;
};

const resetWindowWidth = (value: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value,
  });
};

describe('AssetGrid', () => {
  beforeEach(() => {
    FixedSizeGrid.mockClear();
    gridRenderLog.length = 0;
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({ assets: sampleAssets }),
    })) as unknown as typeof fetch;
  });

  afterEach(() => {
    (global.fetch as jest.Mock | undefined)?.mockReset?.();
  });

  it('renders grid items', async () => {
    resetWindowWidth(1024);
    render(<AssetGrid />);

    expect(screen.getByTestId('grid')).toBeInTheDocument();
    expect(await screen.findByText('Asset 1')).toBeInTheDocument();
  });

  it('targets ten columns around desktop breakpoints', async () => {
    resetWindowWidth(1440);
    render(<AssetGrid />);

    await waitFor(() => {
      const { columnCount } = gridRenderLog[gridRenderLog.length - 1];
      expect(columnCount).toBe(10);
    });
  });

  it('falls back to a single column on narrow mobile widths', async () => {
    resetWindowWidth(360);
    render(<AssetGrid />);

    await waitFor(() => {
      const { columnCount } = gridRenderLog[gridRenderLog.length - 1];
      expect(columnCount).toBe(1);
    });
  });
});

describe('getColumnCount', () => {
  it('clamps to minimum guardrails for mid-size widths', () => {
    expect(getColumnCount(640)).toBeGreaterThanOrEqual(2);
    expect(getColumnCount(1440)).toBe(10);
    expect(getColumnCount(1920)).toBeLessThanOrEqual(12);
  });
});
