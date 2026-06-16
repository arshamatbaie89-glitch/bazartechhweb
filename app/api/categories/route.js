import { NextResponse } from 'next/server'

const categories = [
  { slug: "electronics-car", name: "Electronics & Car Accessories" },
  { slug: "cosmetics-personal-care", name: "Cosmetics & Personal Care" },
  { slug: "fashion-accessories", name: "Fashion & Accessories" },
  { slug: "home-living", name: "Home & Living" },
  { slug: "sports-camping", name: "Sports & Camping" },
  { slug: "stationery-school-bags", name: "Stationery & School Bags" },
  { slug: "cleaning-products", name: "Cleaning Products" },
  { slug: "kitchen-dining", name: "Kitchen & Dining" },
  { slug: "baby-kids", name: "Baby & Kids" },
  { slug: "frozen-items", name: "Frozen Items" },
]

export async function GET() {
  return NextResponse.json({ categories })
}
