import Link from "next/link"

const promos = [
  {
    title: "Flash Sale",
    subtitle: "Up to 70% off on selected items",
    cta: "Shop Flash Deals",
    color: "from-primary to-primary-dark",
    link: "/category/all?sort=price-asc",
  },
  {
    title: "New Arrivals",
    subtitle: "Fresh products just landed",
    cta: "Explore Now",
    color: "from-accent to-accent-dark",
    link: "/category/all?sort=newest",
  },
  {
    title: "Free Delivery",
    subtitle: "On orders over 50 OMR",
    cta: "Start Shopping",
    color: "from-success to-success-dark",
    link: "/category/all",
  },
]

export default function PromoBanner() {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">Special Offers</h2>
        <Link href="/category/all" className="text-sm font-semibold text-accent hover:text-accent-dark transition-colors">
          View All →
        </Link>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {promos.map((promo, i) => (
          <Link
            key={i}
            href={promo.link}
            className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${promo.color} p-6 md:p-8 min-h-[180px] flex flex-col justify-end group ${i === 0 ? "md:col-span-2" : ""}`}
          >
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative z-10">
              <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold text-white mb-3">
                {i === 0 ? "⚡ Limited Time" : i === 1 ? "✨ Just In" : "🚚 Special Offer"}
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">{promo.title}</h3>
              <p className="text-white/80 text-sm mb-4">{promo.subtitle}</p>
              <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-sm font-semibold px-5 py-2.5 rounded-xl group-hover:bg-white/30 transition-all">
                {promo.cta} →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
