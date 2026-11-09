export type ProductImage = string | { url?: string; path?: string }

export function getProductImageUrl(images: unknown, fallback = '/placeholder.jpg') {
  if (!Array.isArray(images)) return fallback
  const first = images[0] as ProductImage | undefined
  const url = typeof first === 'string' ? first : first?.url
  return url || fallback
}

export function getProductImagePaths(images: unknown) {
  if (!Array.isArray(images)) return []
  return images.map((image) => {
    if (typeof image === 'string') {
      const marker = '/product-images/'
      const index = image.indexOf(marker)
      return index >= 0 ? decodeURIComponent(image.slice(index + marker.length).split('?')[0]) : null
    }
    return image?.path || null
  }).filter((path): path is string => Boolean(path))
}
