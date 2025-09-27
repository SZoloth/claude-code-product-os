import React from 'react';
import { render, screen } from '@testing-library/react';
import AssetDetailPage, { getServerSideProps } from './[id]';
import type { AssetWithRelations } from '../../lib/types';
import { getAssetById } from '../../lib/repos/assets';

jest.mock('../../lib/repos/assets', () => ({
  getAssetById: jest.fn(),
}));

const mockedGetAssetById = getAssetById as jest.Mock;

const buildAsset = (overrides: Partial<AssetWithRelations> = {}): AssetWithRelations => ({
  id: 'asset-1',
  slug: 'asset-1',
  name: 'Dragon Knight',
  description: 'Hero character rig with full armor set.',
  type: 'character',
  status: 'approved',
  ownerId: 'user-1',
  tags: ['hero', 'rigged'],
  thumbnailUrl: 'https://example.com/thumb.png',
  turntableUrl: 'https://example.com/turntable.mp4',
  fileSize: 42,
  polyCount: 78000,
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-02-01').toISOString(),
  currentVersionId: null,
  versions: [],
  relations: [
    { id: 'rel-1', assetId: 'asset-1', relatedAssetId: 'asset-2', relationType: 'OTHER' },
  ],
  usageEvents: [
    {
      id: 'usage-1',
      assetId: 'asset-1',
      assetVersionId: null,
      actorId: 'user-2',
      projectId: 'project-1',
      eventType: 'download',
      metadata: null,
      createdAt: new Date('2024-02-10').toISOString(),
    },
  ],
  activityLogs: [
    {
      id: 'activity-1',
      assetId: 'asset-1',
      assetVersionId: null,
      actorId: 'user-3',
      action: 'update',
      payload: null,
      createdAt: new Date('2024-02-08').toISOString(),
    },
  ],
  ...overrides,
});

describe('AssetDetailPage', () => {
  beforeEach(() => {
    mockedGetAssetById.mockReset();
  });

  it('renders asset details and usage history', () => {
    const asset = buildAsset();

    render(<AssetDetailPage asset={asset} />);

    expect(screen.getByRole('heading', { name: 'Dragon Knight' })).toBeInTheDocument();
    expect(screen.getByText('Download Latest Version')).toBeInTheDocument();
    expect(screen.getByText('Project')).toBeInTheDocument();
    expect(screen.getByText('project-1')).toBeInTheDocument();
  });

  it('returns props from getServerSideProps when asset exists', async () => {
    const asset = buildAsset();
    mockedGetAssetById.mockResolvedValueOnce(asset);

    const result = await getServerSideProps({ params: { id: 'asset-1' } } as any);

    expect(result).toEqual({ props: { asset } });
  });

  it('returns notFound when asset is missing', async () => {
    mockedGetAssetById.mockResolvedValueOnce(null);

    const result = await getServerSideProps({ params: { id: 'missing' } } as any);

    expect(result).toEqual({ notFound: true });
  });
});
