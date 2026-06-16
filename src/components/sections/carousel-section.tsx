import { motion } from "framer-motion"
import { getStoredPhotos } from "@/pages/Admin"

const sampleImage =
  "https://cdn.poehali.dev/projects/64288b54-a64f-482e-8186-162b4527ad04/files/2bb49fea-6e02-4213-a1ad-3ae8bfaf1ec3.jpg"

const fallback = [sampleImage, sampleImage, sampleImage, sampleImage, sampleImage, sampleImage]

export function CarouselSection() {
  const stored = getStoredPhotos()
  const portfolioItems = stored.length >= 3 ? stored : fallback
  const items = [...portfolioItems, ...portfolioItems]

  return (
    <section className="bg-primary py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <motion.h2
          className="text-3xl md:text-4xl font-serif text-primary-foreground"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Снято с любовью к деталям.
        </motion.h2>
      </div>

      <div className="relative">
        <motion.div
          className="flex gap-6"
          animate={{ x: [0, "-50%"] }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {items.map((src, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[300px] md:w-[400px] rounded-xl overflow-hidden shadow-2xl"
              data-clickable
            >
              <img
                src={src || "/placeholder.svg"}
                alt={`Пример портфолио ${(i % portfolioItems.length) + 1}`}
                className="w-full h-auto"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}