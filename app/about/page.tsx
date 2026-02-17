"use client"
import React, { useState, ChangeEvent } from "react"

export default function AboutPage() {
    const [texts, setTexts] = useState<string[]>(["", "", ""])
    const [images, setImages] = useState<(string | null)[]>([null, null, null])

    const handleTextChange = (index: number) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const next = [...texts]
        next[index] = e.target.value
        setTexts(next)
    }

    const handleImageChange = (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => {
            const next = [...images]
            next[index] = reader.result as string
            setImages(next)
        }
        reader.readAsDataURL(file)
    }

    const boxStyle: React.CSSProperties = {
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        background: "#fff",
    }

    const imgStyle: React.CSSProperties = {
        width: "100%",
        height: 180,
        objectFit: "cover",
        borderRadius: 6,
        background: "#f6f6f6",
        display: "block",
    }

    return (
        <main style={{ maxWidth: 920, margin: "36px auto", fontFamily: "Segoe UI, Roboto, sans-serif" }}>
            <h1 style={{ marginBottom: 8 }}>About</h1>
            <p style={{ color: "#555", marginTop: 0, marginBottom: 24 }}>
                A simple static layout with a few text boxes and spots for pictures.
            </p>

            <section style={{ display: "grid", gap: 20 }}>
                {[0, 1, 2].map((i) => (
                    <div key={i} style={boxStyle}>
                        <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
                            Section {i + 1}
                        </label>

                        <div style={{ marginBottom: 10 }}>
                            <textarea
                                value={texts[i]}
                                onChange={handleTextChange(i)}
                                placeholder={`Write some text for section ${i + 1}...`}
                                rows={4}
                                style={{
                                    width: "100%",
                                    padding: 10,
                                    borderRadius: 6,
                                    border: "1px solid #ccc",
                                    resize: "vertical",
                                    fontSize: 14,
                                }}
                            />
                        </div>

                        <div>
                            <div style={{ marginBottom: 8, fontSize: 13, color: "#333" }}>Picture</div>
                            <img
                                src={
                                    images[i] ??
                                    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='360'><rect width='100%' height='100%' fill='%23f0f0f0'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23bbb' font-family='Arial' font-size='20'>No image</text></svg>"
                                }
                                alt={`Preview ${i + 1}`}
                                style={imgStyle}
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange(i)}
                                style={{ marginTop: 10 }}
                            />
                        </div>
                    </div>
                ))}
            </section>
        </main>
    )
}