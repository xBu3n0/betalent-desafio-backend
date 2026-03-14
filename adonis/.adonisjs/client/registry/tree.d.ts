/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    newAccount: {
      store: typeof routes['auth.new_account.store']
    }
    accessToken: {
      store: typeof routes['auth.access_token.store']
      destroy: typeof routes['auth.access_token.destroy']
    }
  }
  profile: {
    profile: {
      show: typeof routes['profile.profile.show']
    }
  }
  users: {
    users: {
      index: typeof routes['users.users.index']
      store: typeof routes['users.users.store']
      show: typeof routes['users.users.show']
      update: typeof routes['users.users.update']
      destroy: typeof routes['users.users.destroy']
    }
  }
  gateways: {
    gateways: {
      index: typeof routes['gateways.gateways.index']
      updateStatus: typeof routes['gateways.gateways.update_status']
      updatePriority: typeof routes['gateways.gateways.update_priority']
    }
  }
  products: {
    products: {
      index: typeof routes['products.products.index']
      store: typeof routes['products.products.store']
      show: typeof routes['products.products.show']
      update: typeof routes['products.products.update']
      destroy: typeof routes['products.products.destroy']
    }
  }
  purchases: {
    store: typeof routes['purchases.store']
  }
  clients: {
    clients: {
      index: typeof routes['clients.clients.index']
      show: typeof routes['clients.clients.show']
    }
  }
  transactions: {
    transactions: {
      index: typeof routes['transactions.transactions.index']
      show: typeof routes['transactions.transactions.show']
      refund: typeof routes['transactions.transactions.refund']
    }
  }
}
