import React from 'react';
import Head from 'next/head';
import type { GetServerSideProps, NextPage } from 'next';
import StatusBadge from '../../components/StatusBadge';
import type { AssetWithRelations } from '../../lib/types';
import { getAssetById } from '../../lib/repos/assets';

const PLACEHOLDER_IMAGE = (label: string) =>
  `https://via.placeholder.com/800x600/0f172a/FFFFFF?text=${encodeURIComponent(label)}`;

type AssetDetailProps = {
  asset: AssetWithRelations;
};

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Unknown';

const AssetDetailPage: NextPage<AssetDetailProps> = ({ asset }) => {
  const previewImage = asset.turntableUrl || asset.thumbnailUrl || PLACEHOLDER_IMAGE(asset.name);
  const usageEvents = asset.usageEvents.slice(0, 10);
  const activityLogs = asset.activityLogs.slice(0, 10);

  return (
    <>
      <Head>
        <title>{asset.name} · Dragon&apos;s Legacy Asset</title>
      </Head>
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Asset Detail</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">{asset.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <StatusBadge status={asset.status} />
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase text-slate-600">
                {asset.type}
              </span>
              <span>Created {formatDate(asset.createdAt)}</span>
              <span>Updated {formatDate(asset.updatedAt)}</span>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-slate-800"
          >
            Download Latest Version
          </button>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow">
            <img src={previewImage} alt="Asset preview" className="w-full object-cover" />
            <dl className="grid gap-4 px-6 py-5 text-sm text-slate-600 md:grid-cols-2">
              {asset.description ? (
                <div className="md:col-span-2">
                  <dt className="font-semibold text-slate-900">Description</dt>
                  <dd className="mt-1 leading-relaxed text-slate-600">{asset.description}</dd>
                </div>
              ) : null}
              <div>
                <dt className="font-semibold text-slate-900">Status</dt>
                <dd className="mt-1 capitalize">{asset.status.replace('_', ' ')}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Polycount</dt>
                <dd className="mt-1">{asset.polyCount ?? 'N/A'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">File Size</dt>
                <dd className="mt-1">{asset.fileSize ? `${asset.fileSize} MB` : 'N/A'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Tags</dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  {asset.tags?.length ? (
                    asset.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-slate-600"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">No tags supplied</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow">
              <h2 className="text-base font-semibold text-slate-900">Relationships</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {asset.relations.length ? (
                  asset.relations.map((relation) => (
                    <li key={relation.id} className="rounded-lg border border-slate-100 px-3 py-2">
                      <p className="font-medium text-slate-800">{relation.relationType}</p>
                      <p className="text-xs text-slate-500">Asset ID: {relation.relatedAssetId}</p>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400">No related assets linked</li>
                )}
              </ul>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow">
              <h2 className="text-base font-semibold text-slate-900">Activity</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {activityLogs.length ? (
                  activityLogs.map((log) => (
                    <li key={log.id} className="rounded-lg border border-slate-100 px-3 py-2">
                      <p className="font-medium text-slate-800">{log.action.replace('_', ' ')}</p>
                      <p className="text-xs text-slate-500">{formatDate(log.createdAt)}</p>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400">No activity recorded</li>
                )}
              </ul>
            </section>
          </aside>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
          <h2 className="text-base font-semibold text-slate-900">Usage History</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2">Event</th>
                  <th className="px-4 py-2">Project</th>
                  <th className="px-4 py-2">Actor</th>
                  <th className="px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usageEvents.length ? (
                  usageEvents.map((event) => (
                    <tr key={event.id}>
                      <td className="px-4 py-2 capitalize">{event.eventType}</td>
                      <td className="px-4 py-2">{event.projectId ?? '—'}</td>
                      <td className="px-4 py-2">{event.actorId ?? '—'}</td>
                      <td className="px-4 py-2 text-slate-500">{formatDate(event.createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-6 text-center text-slate-400" colSpan={4}>
                      No usage yet recorded for this asset.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<AssetDetailProps> = async ({ params }) => {
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params?.id[0] : undefined;

  if (!id) {
    return { notFound: true };
  }

  const asset = await getAssetById(id);

  if (!asset) {
    return { notFound: true };
  }

  return {
    props: {
      asset,
    },
  };
};

export default AssetDetailPage;
