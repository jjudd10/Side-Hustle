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
      const { data } = await supabase.from('floorplan').select('*').eq('id', planId).single()

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

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--muted)' }}>Loading…</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '56px 40px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <Link href="/creator/dashboard" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.25em', color: 'var(--muted)', textDecoration: 'none' }}>
          ← Dashboard
        </Link>
        <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Step {step + 1} of {STEPS.length}</span>
      </div>

      <p className="cp-eyebrow" style={{ marginTop: 24 }}>Creator Portal</p>
      <h1 style={{ margin: '12px 0 0', fontSize: '1.9rem' }}>Edit Plan</h1>
      {form.title && <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: 'var(--muted)' }}>{form.title}</p>}

      <div className="cp-steps">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(i)}
            className={`cp-step-seg${i <= step ? ' active' : ''}`}
            aria-label={s}
          />
        ))}
      </div>
      <p className="cp-step-name">{STEPS[step]}</p>

      <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 28 }}>
        {step === 0 && (
          <>
            <div className="cp-field">
              <label className="cp-label">Plan Title</label>
              <input type="text" value={form.title} onChange={e => set('title', e.target.value)} className="cp-input" />
            </div>
            <div className="cp-field">
              <label className="cp-label">URL Slug</label>
              <input type="text" value={form.slug} onChange={e => set('slug', e.target.value)} className="cp-input" />
              <p className="cp-hint">/plans/{form.slug || '…'}</p>
            </div>
            <div className="cp-field">
              <label className="cp-label">Description</label>
              <textarea rows={6} value={form.intro} onChange={e => set('intro', e.target.value)} className="cp-input cp-textarea" />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              <div className="cp-field">
                <label className="cp-label">Bedrooms</label>
                <input type="number" min={0} value={form.beds} onChange={e => set('beds', e.target.value)} className="cp-input" />
              </div>
              <div className="cp-field">
                <label className="cp-label">Bathrooms</label>
                <input type="number" min={0} step={0.5} value={form.baths} onChange={e => set('baths', e.target.value)} className="cp-input" />
              </div>
              <div className="cp-field">
                <label className="cp-label">Sq Ft</label>
                <input type="number" min={0} value={form.area} onChange={e => set('area', e.target.value)} className="cp-input" />
              </div>
            </div>
            <div className="cp-field">
              <label className="cp-label">Base Price (USD)</label>
              <div className="cp-price-wrap">
                <span className="cp-price-prefix">$</span>
                <input type="number" min={0} step={1} value={form.price} onChange={e => set('price', e.target.value)} className="cp-input cp-price-input" />
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

      {error && <p className="cp-error" style={{ marginTop: 20 }}>{error}</p>}

      <div className="cp-btn-row">
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="cp-btn-outline">
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(s => s + 1)} className="cp-btn">Continue</button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting} className="cp-btn">
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
    <div className="cp-field">
      <label className="cp-label">{label}</label>
      {hint && <p className="cp-hint" style={{ margin: '0 0 4px' }}>{hint}</p>}
      <div className="cp-upload-row">
        <button type="button" onClick={() => ref.current?.click()} disabled={uploading} className="cp-upload-btn">
          {uploading ? 'Uploading…' : value ? 'Replace' : 'Choose File'}
        </button>
        {value && <span className="cp-upload-done">✓ Uploaded</span>}
        <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
      </div>
    </div>
  )
}

function FileUploadField({ label, hint, fileType, filePath, uploading, onFile }: { label: string; hint: string; fileType: string; filePath?: string; uploading: boolean; onFile: (f: File) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div className="cp-field">
      <label className="cp-label">{label}</label>
      {hint && <p className="cp-hint" style={{ margin: '0 0 4px' }}>{hint}</p>}
      <div className="cp-upload-row">
        <button type="button" onClick={() => ref.current?.click()} disabled={uploading} className="cp-upload-btn">
          {uploading ? 'Uploading…' : filePath ? 'Replace' : 'Choose File'}
        </button>
        {filePath && <span className="cp-upload-done">✓ Uploaded</span>}
        <input ref={ref} type="file" style={{ display: 'none' }} accept={fileType === 'pdf' ? '.pdf' : '.dwg,.dxf'} onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
      </div>
    </div>
  )
}
