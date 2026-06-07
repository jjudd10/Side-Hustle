'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseBrowserClient } from '@/lib/supabaseBrowserClient'

type FilePaths = { pdf?: string; cad?: string }

type FormState = {
  title: string
  slug: string
  intro: string
  beds: string
  baths: string
  area: string
  price: string
  thumbnail: string
  hero_img: string
  second_img: string
  third_img: string
  fourth_img: string
  file_paths: FilePaths
}

const STEPS = ['Basic Info & Description', 'Specs & Pricing', 'Public Images', 'Deliverable Files']

function slugify(title: string) {
  return title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
}

export default function EditPlanPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const planId = params.id

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<FormState>({
    title: '', slug: '', intro: '',
    beds: '', baths: '', area: '', price: '',
    thumbnail: '', hero_img: '', second_img: '', third_img: '', fourth_img: '',
    file_paths: {},
  })
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowserClient()
      const { data } = await supabase
        .from('floorplan')
        .select('*')
        .eq('id', planId)
        .single()

      if (data) {
        setForm({
          title: data.title ?? '',
          slug: data.slug ?? '',
          intro: data.intro ?? '',
          beds: data.beds != null ? String(data.beds) : '',
          baths: data.baths != null ? String(data.baths) : '',
          area: data.area != null ? String(data.area) : '',
          price: data.price_cents != null ? String(data.price_cents / 100) : '',
          thumbnail: data.thumbnail ?? '',
          hero_img: data.hero_img ?? '',
          second_img: data.second_img ?? '',
          third_img: data.third_img ?? '',
          fourth_img: data.fourth_img ?? '',
          file_paths: data.file_paths ?? {},
        })
      }
      setLoading(false)
    }
    load()
  }, [planId])

  function set(field: keyof FormState, value: string) {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'title' && !prev.slug) next.slug = slugify(value)
      return next
    })
  }

  async function uploadImage(field: keyof FormState, file: File) {
    setUploading(u => ({ ...u, [field]: true }))
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/r2-upload-url', { method: 'POST', body: fd })
    setUploading(u => ({ ...u, [field]: false }))
    if (!res.ok) { setError('Image upload failed.'); return }
    const { webUrl, thumbUrl } = await res.json()
    setForm(prev => ({ ...prev, [field]: field === 'thumbnail' ? thumbUrl : webUrl }))
  }

  async function uploadFile(fileType: 'pdf' | 'cad', file: File) {
    setUploading(u => ({ ...u, [fileType]: true }))
    const fd = new FormData()
    fd.append('file', file)
    fd.append('fileType', fileType)
    const res = await fetch('/api/r2-upload-private', { method: 'POST', body: fd })
    setUploading(u => ({ ...u, [fileType]: false }))
    if (!res.ok) { setError('File upload failed.'); return }
    const { filePath } = await res.json()
    setForm(prev => ({ ...prev, file_paths: { ...prev.file_paths, [fileType]: filePath } }))
  }

  async function handleSubmit() {
    setError('')
    setSubmitting(true)
    const res = await fetch(`/api/creator/plans/${planId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        slug: form.slug,
        intro: form.intro || null,
        beds: form.beds ? Number(form.beds) : null,
        baths: form.baths ? Number(form.baths) : null,
        area: form.area ? Number(form.area) : null,
        price_cents: form.price ? Math.round(Number(form.price) * 100) : null,
        thumbnail: form.thumbnail || null,
        hero_img: form.hero_img || null,
        second_img: form.second_img || null,
        third_img: form.third_img || null,
        fourth_img: form.fourth_img || null,
        file_paths: Object.keys(form.file_paths).length ? form.file_paths : null,
      }),
    })
    setSubmitting(false)
    if (!res.ok) {
      const { error: e } = await res.json()
      setError(e ?? 'Update failed.')
      return
    }
    router.push('/creator/dashboard?updated=1')
  }

  const inputClass = 'mt-2 w-full rounded border border-secondary-800 bg-black/30 px-4 py-3 text-secondary-100 placeholder-secondary-600 focus:border-accent-gold focus:outline-none'
  const labelClass = 'block text-xs uppercase tracking-[0.3em] text-secondary-400'

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-secondary-400">Loading…</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-2 flex items-center justify-between">
        <Link href="/creator/dashboard" className="text-xs uppercase tracking-[0.3em] text-secondary-600 hover:text-secondary-400">
          ← Dashboard
        </Link>
        <span className="text-xs text-secondary-600">Step {step + 1} of {STEPS.length}</span>
      </div>

      <p className="text-sm uppercase tracking-[0.4em] text-accent-gold">Creator Portal</p>
      <h1 className="mt-2 font-serif text-3xl text-secondary-100">Edit Plan</h1>
      <p className="mt-1 text-xs text-secondary-600">Editing: {form.title}</p>

      <div className="mt-8 flex gap-1">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(i)}
            className={`h-1 flex-1 rounded-full transition ${i <= step ? 'bg-accent-gold' : 'bg-secondary-800'}`}
          />
        ))}
      </div>
      <p className="mt-3 text-sm text-secondary-400">{STEPS[step]}</p>

      <div className="mt-8 space-y-6">
        {step === 0 && (
          <>
            <div>
              <label className={labelClass}>Plan Title</label>
              <input type="text" value={form.title} onChange={e => set('title', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>URL Slug</label>
              <input type="text" value={form.slug} onChange={e => set('slug', e.target.value)} className={inputClass} />
              <p className="mt-1 text-xs text-secondary-600">/plans/{form.slug || '…'}</p>
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea rows={6} value={form.intro} onChange={e => set('intro', e.target.value)} className={`${inputClass} resize-none`} />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Bedrooms</label>
                <input type="number" min={0} value={form.beds} onChange={e => set('beds', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Bathrooms</label>
                <input type="number" min={0} step={0.5} value={form.baths} onChange={e => set('baths', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Area (sq ft)</label>
                <input type="number" min={0} value={form.area} onChange={e => set('area', e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Base Price (USD)</label>
              <div className="relative mt-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400">$</span>
                <input type="number" min={0} step={1} value={form.price} onChange={e => set('price', e.target.value)} className={`${inputClass} mt-0 pl-8`} />
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {(
              [
                { field: 'thumbnail' as keyof FormState, label: 'Thumbnail', hint: 'Small card image.' },
                { field: 'hero_img' as keyof FormState, label: 'Hero Image', hint: '' },
                { field: 'second_img' as keyof FormState, label: 'Gallery Image 2', hint: '' },
                { field: 'third_img' as keyof FormState, label: 'Gallery Image 3', hint: '' },
                { field: 'fourth_img' as keyof FormState, label: 'Gallery Image 4', hint: '' },
              ] as { field: keyof FormState; label: string; hint: string }[]
            ).map(({ field, label, hint }) => (
              <ImageUploadField
                key={field} label={label} hint={hint}
                value={form[field] as string}
                uploading={!!uploading[field]}
                onFile={file => uploadImage(field, file)}
              />
            ))}
          </>
        )}

        {step === 3 && (
          <>
            <FileUploadField label="PDF Floor Plan" hint="Delivered to customers after purchase." fileType="pdf" filePath={form.file_paths.pdf} uploading={!!uploading['pdf']} onFile={file => uploadFile('pdf', file)} />
            <FileUploadField label="CAD Files" hint="DWG or DXF. Optional." fileType="cad" filePath={form.file_paths.cad} uploading={!!uploading['cad']} onFile={file => uploadFile('cad', file)} />
          </>
        )}
      </div>

      {error && <p className="mt-6 text-sm text-red-400">{error}</p>}

      <div className="mt-10 flex items-center justify-between">
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="rounded border border-secondary-800 px-5 py-2.5 text-xs uppercase tracking-[0.3em] text-secondary-400 transition hover:border-secondary-600 disabled:opacity-30">
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(s => s + 1)} className="rounded bg-accent-gold px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.4em] text-black shadow-luxury transition hover:bg-accent-bronze">
            Continue
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting} className="rounded bg-accent-gold px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.4em] text-black shadow-luxury transition hover:bg-accent-bronze disabled:opacity-50">
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
        )}
      </div>
    </div>
  )
}

function ImageUploadField({ label, hint, value, uploading, onFile }: { label: string; hint: string; value: string; uploading: boolean; onFile: (f: File) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div>
      <label className="block text-xs uppercase tracking-[0.3em] text-secondary-400">{label}</label>
      {hint && <p className="mt-0.5 text-xs text-secondary-600">{hint}</p>}
      <div className="mt-2 flex items-center gap-4">
        <button type="button" onClick={() => ref.current?.click()} disabled={uploading} className="rounded border border-secondary-800 px-4 py-2 text-xs uppercase tracking-[0.3em] text-secondary-400 transition hover:border-secondary-600 hover:text-secondary-200 disabled:opacity-50">
          {uploading ? 'Uploading…' : value ? 'Replace' : 'Choose File'}
        </button>
        {value && <span className="text-xs text-accent-gold">✓ Uploaded</span>}
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
      </div>
    </div>
  )
}

function FileUploadField({ label, hint, fileType, filePath, uploading, onFile }: { label: string; hint: string; fileType: string; filePath?: string; uploading: boolean; onFile: (f: File) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div>
      <label className="block text-xs uppercase tracking-[0.3em] text-secondary-400">{label}</label>
      {hint && <p className="mt-0.5 text-xs text-secondary-600">{hint}</p>}
      <div className="mt-2 flex items-center gap-4">
        <button type="button" onClick={() => ref.current?.click()} disabled={uploading} className="rounded border border-secondary-800 px-4 py-2 text-xs uppercase tracking-[0.3em] text-secondary-400 transition hover:border-secondary-600 hover:text-secondary-200 disabled:opacity-50">
          {uploading ? 'Uploading…' : filePath ? 'Replace' : 'Choose File'}
        </button>
        {filePath && <span className="text-xs text-accent-gold">✓ Uploaded</span>}
        <input ref={ref} type="file" className="hidden" accept={fileType === 'pdf' ? '.pdf' : '.dwg,.dxf'} onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
      </div>
    </div>
  )
}
