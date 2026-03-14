import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_token.store': { paramsTuple?: []; params?: {} }
    'auth.access_token.destroy': { paramsTuple?: []; params?: {} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'users.users.index': { paramsTuple?: []; params?: {} }
    'users.users.store': { paramsTuple?: []; params?: {} }
    'users.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'gateways.gateways.index': { paramsTuple?: []; params?: {} }
    'gateways.gateways.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'gateways.gateways.update_priority': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'products.products.index': { paramsTuple?: []; params?: {} }
    'products.products.store': { paramsTuple?: []; params?: {} }
    'products.products.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'products.products.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'products.products.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'purchases.store': { paramsTuple?: []; params?: {} }
    'clients.clients.index': { paramsTuple?: []; params?: {} }
    'clients.clients.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'transactions.transactions.index': { paramsTuple?: []; params?: {} }
    'transactions.transactions.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'transactions.transactions.refund': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'users.users.index': { paramsTuple?: []; params?: {} }
    'users.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'gateways.gateways.index': { paramsTuple?: []; params?: {} }
    'products.products.index': { paramsTuple?: []; params?: {} }
    'products.products.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'clients.clients.index': { paramsTuple?: []; params?: {} }
    'clients.clients.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'transactions.transactions.index': { paramsTuple?: []; params?: {} }
    'transactions.transactions.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'users.users.index': { paramsTuple?: []; params?: {} }
    'users.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'gateways.gateways.index': { paramsTuple?: []; params?: {} }
    'products.products.index': { paramsTuple?: []; params?: {} }
    'products.products.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'clients.clients.index': { paramsTuple?: []; params?: {} }
    'clients.clients.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'transactions.transactions.index': { paramsTuple?: []; params?: {} }
    'transactions.transactions.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_token.store': { paramsTuple?: []; params?: {} }
    'auth.access_token.destroy': { paramsTuple?: []; params?: {} }
    'users.users.store': { paramsTuple?: []; params?: {} }
    'products.products.store': { paramsTuple?: []; params?: {} }
    'purchases.store': { paramsTuple?: []; params?: {} }
    'transactions.transactions.refund': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'users.users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'gateways.gateways.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'gateways.gateways.update_priority': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'products.products.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'users.users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'products.products.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}