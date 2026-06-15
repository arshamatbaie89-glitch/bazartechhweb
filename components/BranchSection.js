"use client"

import { useLanguage } from "@/context/LanguageContext"

const branches = [
  {
    name: "Al Mabilah",
    arabic: "المعبيلة",
    phone: "+968 97971117",
    address: "Seeb Street Mabella, Seeb 122, Muscat, Oman",
    instagram: "@bazartech.om",
    hours: "Sat-Thu 9AM-11PM | Fri 2PM-11PM",
  },
  {
    name: "Amerat",
    arabic: "العامرات",
    phone: "+968 79912207",
    address: "Muscat-Sur Rd, Amerat, Oman",
    instagram: "@bazartech.om",
    hours: "Sat-Thu 9AM-11PM | Fri 2PM-11PM",
  },
  {
    name: "Nizwa",
    arabic: "نزوى",
    phone: "+968 95809797",
    address: "Nizwa, Oman",
    instagram: "@bazartech.om",
    hours: "Sat-Thu 9AM-11PM | Fri 2PM-11PM",
  },
  {
    name: "Sohar",
    arabic: "صحار",
    phone: "+968 97999001",
    address: "Sohar, Oman",
    instagram: "@bazartech.om",
    hours: "Sat-Thu 9AM-11PM | Fri 2PM-11PM",
  },

]

export default function BranchSection() {
  const { t } = useLanguage()
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t("branches.title")}</h2>
          <p className="text-muted-foreground text-sm mt-1">{t("branches.subtitle")}</p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map((branch) => (
          <div key={branch.name} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 group hover:shadow-lg hover:border-[#FFC220]/50 dark:hover:border-[#FFC220] transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-foreground text-lg">{branch.name}</h3>
                <p className="text-sm text-muted-foreground">{branch.arabic}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <div className="space-y-2.5 text-sm">
              <a href={`tel:${branch.phone}`} className="flex items-center gap-3 text-muted-foreground hover:text-accent transition-colors">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{branch.phone}</span>
              </a>
              <div className="flex items-start gap-3 text-muted-foreground">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs leading-relaxed">{branch.address}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs">{branch.hours}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="text-xs">{branch.instagram}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <a href={`tel:${branch.phone}`} className="flex-1 text-center text-sm font-semibold py-2.5 rounded-xl bg-primary/5 text-primary hover:bg-primary/10 dark:bg-accent/10 dark:text-accent dark:hover:bg-accent/20 transition-colors">
                {t("branches.call")}
              </a>
              <a
                href={`https://wa.me/${branch.phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center text-sm font-semibold py-2.5 rounded-xl bg-success/10 text-success-dark hover:bg-success/20 dark:text-success dark:hover:bg-success/15 transition-colors"
              >
                {t("branches.whatsapp")}
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
