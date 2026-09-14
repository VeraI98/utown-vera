export interface AddressResponse {
  id: number
  area: string
  city: string
  details: string
  fullAddress: string
  latitude: number
  longitude: number
  postcode: string
  state: string
  street: string
  typeAddress: number
  intercomCode: string
}

export type CreateAddressRequest = Omit<AddressResponse, 'id'>
