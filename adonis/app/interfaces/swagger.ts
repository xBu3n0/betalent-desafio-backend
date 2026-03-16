export interface MessageResponse {
  message: string
}

export interface ErrorItem {
  message: string
  field?: string
  rule?: string
  code?: string
}

export interface ErrorResponse {
  errors: ErrorItem[]
}

export interface UserResource {
  id: number
  email: string
  role: string
}

export interface AuthPayload {
  user: UserResource
  token: string
}

export interface AuthResponse {
  data: AuthPayload
}

export interface UserResponse {
  data: UserResource
}

export interface UserCollectionResponse {
  data: UserResource[]
}

export interface GatewayResource {
  id: number
  name: string
  isActive: boolean
  priority: number
}

export interface GatewayResponse {
  data: GatewayResource
}

export interface GatewayCollectionResponse {
  data: GatewayResource[]
}

export interface ProductResource {
  id: number
  name: string
  amount: string
}

export interface ProductResponse {
  data: ProductResource
}

export interface ProductCollectionResponse {
  data: ProductResource[]
}

export interface ClientResource {
  id: number
  name: string
  email: string
}

export interface ClientCollectionResponse {
  data: ClientResource[]
}

export interface TransactionResource {
  id: number
  clientId: number
  gatewayId: number
  externalId: string
  status: string
  amount: string
  cardLastNumbers: string
}

export interface TransactionCollectionResponse {
  data: TransactionResource[]
}

export interface TransactionItemResource {
  quantity: number
  product: ProductResource
}

export interface TransactionDetailsResource {
  id: number
  externalId: string
  status: string
  amount: string
  cardLastNumbers: string
  client: ClientResource
  gateway: GatewayResource
  items: TransactionItemResource[]
}

export interface TransactionDetailsResponse {
  data: TransactionDetailsResource
}

export interface ClientDetailsResource {
  id: number
  name: string
  email: string
  transactions: TransactionDetailsResource[]
}
