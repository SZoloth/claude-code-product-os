import type { NextApiRequest, NextApiResponse } from 'next';
import { listAssets } from '@/lib/repos/assets';

const PLACEHOLDER_IMAGE = (label: string) =>
  `https://via.placeholder.com/300/111827/FFFFFF?text=${encodeURIComponent(label)}`;

export type ApiAsset = {
  id: string;
  name: string;
  status: 'draft' | 'in_review' | 'approved' | 'deprecated';
  imageUrl: string;
  description?: string;
};

export type AssetsResponse = {
  assets: ApiAsset[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AssetsResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const assets = await listAssets({ take: 200 });

    const response: AssetsResponse = {
      assets: assets.map((asset) => ({
        id: asset.id,
        name: asset.name,
        status: asset.status,
        imageUrl: asset.thumbnailUrl ?? PLACEHOLDER_IMAGE(asset.name),
        description: asset.description,
      })),
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Failed to load assets', error);
    return res.status(500).json({ error: 'Failed to load assets' });
  }
}
