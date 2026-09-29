import { api } from './api'
import { resolveImageUrl } from '../utils/imageUrl'

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await api.post<Record<string, string>>(
    '/files/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )

  const url =
    data.url ??
    data.fileUrl ??
    data.imageUrl ??
    data.path ??
    Object.values(data)[0]

  if (!url) {
    throw new Error('Upload response did not contain a file URL')
  }

  return resolveImageUrl(url, api.defaults.baseURL!)
}
