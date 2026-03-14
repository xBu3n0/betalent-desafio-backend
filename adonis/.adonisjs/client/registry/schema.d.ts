/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'auth.new_account.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/signup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').createUserValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').createUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/http/new_account_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/http/new_account_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.access_token.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/http/access_token_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/http/access_token_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.access_token.destroy': {
    methods: ["POST"]
    pattern: '/api/v1/auth/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/http/access_token_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/http/access_token_controller').default['destroy']>>>
    }
  }
  'profile.profile.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/http/profile_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/http/profile_controller').default['show']>>>
    }
  }
  'users.users.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/users'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/http/users_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/http/users_controller').default['index']>>>
    }
  }
  'users.users.store': {
    methods: ["POST"]
    pattern: '/api/v1/users'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').createUserValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').createUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/http/users_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/http/users_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'users.users.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/users/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/http/users_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/http/users_controller').default['show']>>>
    }
  }
  'users.users.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/users/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').updateUserValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/user').updateUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/http/users_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/http/users_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'users.users.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/users/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/http/users_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/http/users_controller').default['destroy']>>>
    }
  }
  'gateways.gateways.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/gateways'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/http/gateways_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/http/gateways_controller').default['index']>>>
    }
  }
  'gateways.gateways.update_status': {
    methods: ["PATCH"]
    pattern: '/api/v1/gateways/:id/status'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/gateway').updateGatewayStatusValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/gateway').updateGatewayStatusValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/http/gateways_controller').default['updateStatus']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/http/gateways_controller').default['updateStatus']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'gateways.gateways.update_priority': {
    methods: ["PATCH"]
    pattern: '/api/v1/gateways/:id/priority'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/gateway').updateGatewayPriorityValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/gateway').updateGatewayPriorityValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/http/gateways_controller').default['updatePriority']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/http/gateways_controller').default['updatePriority']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'products.products.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/products'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/http/products_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/http/products_controller').default['index']>>>
    }
  }
  'products.products.store': {
    methods: ["POST"]
    pattern: '/api/v1/products'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/product').createProductValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/product').createProductValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/http/products_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/http/products_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'products.products.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/products/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/http/products_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/http/products_controller').default['show']>>>
    }
  }
  'products.products.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/products/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/product').updateProductValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/product').updateProductValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/http/products_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/http/products_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'products.products.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/products/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/http/products_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/http/products_controller').default['destroy']>>>
    }
  }
  'purchases.store': {
    methods: ["POST"]
    pattern: '/api/v1/purchases'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/purchase').createPurchaseValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/purchase').createPurchaseValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/http/purchases_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/http/purchases_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'clients.clients.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/clients'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/http/clients_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/http/clients_controller').default['index']>>>
    }
  }
  'clients.clients.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/clients/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/http/clients_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/http/clients_controller').default['show']>>>
    }
  }
  'transactions.transactions.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/transactions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/transaction').listTransactionsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/http/transactions_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/http/transactions_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'transactions.transactions.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/transactions/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/http/transactions_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/http/transactions_controller').default['show']>>>
    }
  }
  'transactions.transactions.refund': {
    methods: ["POST"]
    pattern: '/api/v1/transactions/:id/refund'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/http/transactions_controller').default['refund']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/http/transactions_controller').default['refund']>>>
    }
  }
}
