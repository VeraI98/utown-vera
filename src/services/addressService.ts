import { api } from './api'

import type {
  AddressResponse,
  CreateAddressRequest,
} from '../types/address'

export async function getMyAddresses(): Promise<AddressResponse[]> {
  const { data } = await api.get<AddressResponse[]>(
    '/addresses/my-addresses',
  )

  return data
}

export async function createAddress(
  request: CreateAddressRequest,
): Promise<AddressResponse> {
  const { data } = await api.post<AddressResponse>(
    '/addresses',
    request,
  )

  return data
}