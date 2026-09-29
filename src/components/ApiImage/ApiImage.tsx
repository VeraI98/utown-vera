import type { ImgHTMLAttributes } from 'react'
import { resolveImageUrl } from '../../utils/imageUrl'

export default function ApiImage({
  src,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  const apiUrl =
    import.meta.env.VITE_API_URL || 'https://utown-api.habsida.net/api'
  const localAsset = src?.startsWith('/src/') || src?.startsWith('/assets/')
  return (
    <img
      {...props}
      src={src && !localAsset ? resolveImageUrl(src, apiUrl) : src}
    />
  )
}
