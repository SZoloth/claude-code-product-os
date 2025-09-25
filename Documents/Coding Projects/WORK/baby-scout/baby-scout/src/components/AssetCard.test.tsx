import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import AssetCard, { AssetCardSkeleton } from './AssetCard';

const mockAsset = {
  id: 'asset-123',
  name: 'Aurora Blade',
  imageUrl: 'https://example.com/aurora.png',
  status: 'approved' as const,
  description: 'Primary hero sword asset with PBR textures.',
};

describe('AssetCard', () => {
  it('renders asset details and status badge', () => {
    render(<AssetCard asset={mockAsset} />);

    expect(screen.getByText('Aurora Blade')).toBeInTheDocument();
    expect(screen.getByText('Primary hero sword asset with PBR textures.')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('triggers download callback when button is clicked', () => {
    const onDownload = jest.fn();
    render(<AssetCard asset={mockAsset} onDownload={onDownload} />);

    fireEvent.click(screen.getByTestId('asset-download'));
    expect(onDownload).toHaveBeenCalledWith('asset-123');
  });

  it('shows progress state when downloading', () => {
    render(<AssetCard asset={mockAsset} isDownloading />);

    const button = screen.getByTestId('asset-download');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Downloading…');
  });
});

describe('AssetCardSkeleton', () => {
  it('renders skeleton placeholders', () => {
    const { container } = render(<AssetCardSkeleton />);
    expect(container.querySelectorAll('.bg-slate-200')).not.toHaveLength(0);
  });
});
