import { api } from './api'

export interface OperatingModeResponse {
  id: number
  dayOfWeek: number
  start: string | null
  end: string | null
  dayOff: boolean
}

export interface OperatingModeRequest {
  dayOfWeek: number
  start: string | null
  end: string | null
  dayOff: boolean
}

export async function getOwnerOperatingModes(
  restaurantId: number,
): Promise<OperatingModeResponse[]> {
  const { data } = await api.get<
    OperatingModeResponse[]
  >(
    `/restaurant-owner/restaurants/${restaurantId}/operating-modes`,
  )

  return data
}

export async function createOwnerOperatingMode(
  restaurantId: number,
  request: OperatingModeRequest,
): Promise<OperatingModeResponse> {
  const { data } = await api.post<
    OperatingModeResponse
  >(
    `/restaurant-owner/restaurants/${restaurantId}/operating-modes`,
    request,
  )

  return data
}

export async function updateOwnerOperatingMode(
  restaurantId: number,
  modeId: number,
  request: OperatingModeRequest,
): Promise<OperatingModeResponse> {
  const { data } = await api.put<
    OperatingModeResponse
  >(
    `/restaurant-owner/restaurants/${restaurantId}/operating-modes/${modeId}`,
    request,
  )

  return data
}

export async function replaceOwnerOperatingModes(
  restaurantId: number,
  request: OperatingModeRequest[],
): Promise<OperatingModeResponse[]> {
  const { data } = await api.put<
    OperatingModeResponse[]
  >(
    `/restaurant-owner/restaurants/${restaurantId}/operating-modes`,
    request,
  )

  return data
}

export async function deleteOwnerOperatingMode(
  restaurantId: number,
  modeId: number,
): Promise<void> {
  await api.delete(
    `/restaurant-owner/restaurants/${restaurantId}/operating-modes/${modeId}`,
  )
}