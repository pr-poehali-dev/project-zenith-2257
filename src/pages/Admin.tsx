import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"

const UPLOAD_URL = "https://functions.poehali.dev/39789315-c078-4e77-b00c-c3c175c848c4"
const STORAGE_KEY = "portfolio_photos"

export function getStoredPhotos(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
  } catch {
    return []
  }
}

function setStoredPhotos(urls: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(urls))
}

export default function Admin() {
  const navigate = useNavigate()
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")
  const [dragging, setDragging] = useState(false)

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return
    const arr = Array.from(newFiles).filter(f => f.type.startsWith("image/"))
    setFiles(prev => {
      const combined = [...prev, ...arr]
      return combined.slice(0, 18)
    })
  }

  const removeFile = (i: number) => setFiles(prev => prev.filter((_, idx) => idx !== i))

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }, [])

  const upload = async () => {
    if (!files.length) return
    setUploading(true)
    setError("")
    setProgress(0)

    const BATCH = 3
    const allUrls: string[] = [...getStoredPhotos()]

    for (let i = 0; i < files.length; i += BATCH) {
      const batch = files.slice(i, i + BATCH)
      const encoded = await Promise.all(
        batch.map(async f => {
          const buf = await f.arrayBuffer()
          const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)))
          return { name: f.name, type: f.type, data: b64 }
        })
      )

      const res = await fetch(UPLOAD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: encoded }),
      })

      if (!res.ok) {
        setError("Ошибка загрузки. Попробуйте ещё раз.")
        setUploading(false)
        return
      }

      const json = await res.json()
      allUrls.push(...json.uploaded.map((u: { url: string }) => u.url))
      setProgress(Math.round(((i + batch.length) / files.length) * 100))
    }

    setStoredPhotos(allUrls)
    setUploading(false)
    setDone(true)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <button
          onClick={() => navigate("/")}
          className="text-zinc-500 hover:text-white text-sm mb-8 flex items-center gap-2 transition-colors"
        >
          ← На сайт
        </button>

        <h1 className="text-3xl font-serif mb-2">Загрузка фотографий</h1>
        <p className="text-zinc-400 text-sm mb-8">Максимум 18 фото. После загрузки они появятся в галерее и карусели.</p>

        {done ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">✓</div>
            <p className="text-xl font-serif mb-2">Фото загружены!</p>
            <p className="text-zinc-400 text-sm mb-8">Они уже отображаются на сайте.</p>
            <button
              onClick={() => navigate("/")}
              className="bg-white text-black px-8 py-3 rounded-full text-sm font-medium hover:bg-zinc-200 transition-colors"
            >
              Посмотреть сайт
            </button>
          </div>
        ) : (
          <>
            <div
              onDrop={onDrop}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onClick={() => document.getElementById("file-input")?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors mb-6 ${
                dragging ? "border-white bg-white/5" : "border-zinc-700 hover:border-zinc-500"
              }`}
            >
              <input
                id="file-input"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => addFiles(e.target.files)}
              />
              <p className="text-zinc-300 mb-1">Перетащите фото сюда или нажмите для выбора</p>
              <p className="text-zinc-600 text-sm">JPG, PNG, WEBP · до 18 штук</p>
            </div>

            {files.length > 0 && (
              <div className="mb-6">
                <p className="text-zinc-400 text-sm mb-3">Выбрано: {files.length} / 18</p>
                <div className="grid grid-cols-4 gap-2">
                  {files.map((f, i) => (
                    <div key={i} className="relative group aspect-[273/212] rounded-lg overflow-hidden bg-zinc-800">
                      <img
                        src={URL.createObjectURL(f)}
                        alt={f.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={e => { e.stopPropagation(); removeFile(i) }}
                        className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

            {uploading && (
              <div className="mb-4">
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-zinc-500 text-xs mt-2">Загружаю... {progress}%</p>
              </div>
            )}

            <button
              onClick={upload}
              disabled={!files.length || uploading}
              className="w-full bg-white text-black py-3 rounded-full font-medium text-sm hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {uploading ? "Загружаю..." : `Загрузить ${files.length ? `(${files.length})` : ""}`}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
