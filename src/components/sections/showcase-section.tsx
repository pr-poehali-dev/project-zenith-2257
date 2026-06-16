import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { getStoredPhotos } from "@/pages/Admin"

const sampleImage =
  "https://cdn.poehali.dev/projects/64288b54-a64f-482e-8186-162b4527ad04/files/2bb49fea-6e02-4213-a1ad-3ae8bfaf1ec3.jpg"

const offsets: [number, number][] = [
  [100, -100], [150, -150], [80, -80],
  [120, -120], [90, -90], [140, -140],
  [70, -70], [110, -110], [130, -130],
]

export function ShowcaseSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const stored = getStoredPhotos()
  const showcaseImages = stored.length >= 3 ? stored.slice(0, 9) : [sampleImage, sampleImage, sampleImage]

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const y0 = useTransform(scrollYProgress, [0, 1], offsets[0])
  const y1 = useTransform(scrollYProgress, [0, 1], offsets[1])
  const y2 = useTransform(scrollYProgress, [0, 1], offsets[2])
  const y3 = useTransform(scrollYProgress, [0, 1], offsets[3])
  const y4 = useTransform(scrollYProgress, [0, 1], offsets[4])
  const y5 = useTransform(scrollYProgress, [0, 1], offsets[5])
  const y6 = useTransform(scrollYProgress, [0, 1], offsets[6])
  const y7 = useTransform(scrollYProgress, [0, 1], offsets[7])
  const y8 = useTransform(scrollYProgress, [0, 1], offsets[8])

  const yValues = [y0, y1, y2, y3, y4, y5, y6, y7, y8]

  return (
    <section ref={containerRef} className="bg-background px-6 py-32 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.p
          className="text-muted-foreground text-sm uppercase tracking-widest mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Галерея
        </motion.p>

        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          {showcaseImages.map((src, i) => (
            <motion.div
              key={i}
              className="relative w-[273px] h-[212px] rounded-xl overflow-hidden group flex-shrink-0"
              style={{ y: yValues[i] }}
              initial={{ clipPath: "inset(100% 0 0 0)" }}
              whileInView={{ clipPath: "inset(0 0 0 0)" }}
              viewport={{ once: true }}
              transition={{
                duration: 1,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              data-clickable
            >
              <motion.img
                src={src}
                alt={`Фотография ${i + 1}`}
                width={273}
                height={212}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
