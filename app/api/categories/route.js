import { NextResponse } from 'next/server'

const categories = [
  { slug: "electronics", name: "Electronics" },
  { slug: "fashion", name: "Fashion" },
  { slug: "home-living", name: "Home & Living" },
  { slug: "sports", name: "Sports" },
  { slug: "beauty", name: "Beauty" },
  { slug: "books", name: "Books" },
]

export async function GET() {
  return NextResponse.json({ categories })
}
