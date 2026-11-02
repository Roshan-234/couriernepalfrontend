"use client";
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api, { errorMessage } from '@/lib/api';
import type { SitePage } from '@/lib/content';

export default function ContentPage() {
  const cache = useQueryClient();
  const { data = [], error, isLoading, refetch } = useQuery<SitePage[]>({ queryKey: ['site-content'], queryFn: async () => (await api.get('/content/admin/pages')).data.pages });
  const [editing, setEditing] = useState<SitePage | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editing) return;
    const { title, description, eyebrow, heading, intro, published, version, sections } = editing;
    const payload = { title, description, eyebrow, heading, intro, published, version, sections };
    setBusy(true); setMessage('');
    try {
      const { data } = await api.put('/content/admin/page', payload, { params: { path: editing.path } });
      setEditing(data); await cache.invalidateQueries({ queryKey: ['site-content'] });
      setMessage('Saved. Published changes appear on the next page load.');
    } catch (error) { setMessage(errorMessage(error)); } finally { setBusy(false); }
  }
  return <div className="space-y-6"><h1 className="text-3xl font-bold">Website content & SEO</h1><p className="text-slate-500">Manage public page copy, search descriptions and publication. Unsaved changes are replaced when you select another page.</p>
    {isLoading ? <p role="status">Loading pages…</p> : error ? <p role="alert">{errorMessage(error)}</p> : <label className="block text-sm font-medium">Choose a page<select className="field mt-2" disabled={busy} value={editing?.path || ''} onChange={e => { setEditing(data.find(page => page.path === e.target.value) || null); setMessage(''); }}><option value="">Select a page</option>{data.map(page => <option key={page.path} value={page.path}>{page.path} — {page.title}{page.published ? '' : ' (unpublished)'}</option>)}</select></label>}
    {message && <p role="status" className="panel">{message}</p>}
    {editing && <form key={`${editing.path}-${editing.version}-${editing.sections.length}`} onSubmit={save} className="panel space-y-5"><fieldset disabled={busy} className="space-y-5">
      {([['title', 'SEO title', 160], ['description', 'Search description', 320], ['eyebrow', 'Eyebrow', 160], ['heading', 'Page heading', 200], ['intro', 'Introduction', 5000]] as const).map(([key, label, limit]) => <label key={key} className="block text-sm font-medium">{label}<textarea name={key} className="field mt-2" rows={key === 'intro' ? 4 : 2} maxLength={limit} value={editing[key]} onChange={event => setEditing({ ...editing, [key]: event.target.value })} required={['title', 'description', 'heading'].includes(key)} /></label>)}
      {editing.sections.map((section, i) => <fieldset key={i} className="space-y-3 rounded-lg border p-4"><legend className="px-2 text-sm">Section {i + 1}</legend><label className="block text-sm">Heading<input className="field mt-2" name={`heading-${i}`} value={section.heading} onChange={event => setEditing({ ...editing, sections: editing.sections.map((item, index) => index === i ? { ...item, heading: event.target.value } : item) })} required maxLength={200} /></label><label className="block text-sm">Text<textarea className="field mt-2" name={`body-${i}`} value={section.body} onChange={event => setEditing({ ...editing, sections: editing.sections.map((item, index) => index === i ? { ...item, body: event.target.value } : item) })} required maxLength={5000} rows={4} /></label><button type="button" disabled={busy} className="text-sm text-red-700" onClick={() => setEditing({ ...editing, sections: editing.sections.filter((_, index) => index !== i) })}>Remove section</button></fieldset>)}
      <button type="button" className="action action-outline" disabled={busy || editing.sections.length >= 20} onClick={() => setEditing({ ...editing, sections: [...editing.sections, { heading: "", body: "" }] })}>Add section</button>
      <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="published" checked={editing.published} onChange={event => setEditing({ ...editing, published: event.target.checked })} /> Publish page (homepage must remain published)</label>
      <div className="flex gap-4"><button className="action" disabled={busy}>{busy ? 'Saving…' : 'Save page'}</button><button type="button" disabled={busy} onClick={async () => { const fresh = await refetch(); setEditing(fresh.data?.find(page => page.path === editing.path) || null); setMessage('Reloaded the latest version.'); }}>Discard / reload</button></div>
    </fieldset></form>}
  </div>;
}
