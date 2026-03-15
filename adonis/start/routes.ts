/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

// router.get('/', () => {
//   return { hello: 'world' }
// })

router
  .group(() => {
    router
      .group(() => {
        // router.post('signup', [controllers.http.NewAccount, 'store'])
        router.post('login', [controllers.http.AccessToken, 'store'])
        router.post('logout', [controllers.http.AccessToken, 'destroy']).use(middleware.auth())
      })
      .prefix('auth')
      .as('auth')

    router
      .group(() => {
        // router.get('/profile', [controllers.http.Profile, 'show'])
      })
      .prefix('account')
      .as('profile')
      .use(middleware.auth())

    router
      .group(() => {
        router
          .get('/', [controllers.http.Users, 'index'])
          .use(middleware.user({ abilities: ['readAll'] }))

        router
          .post('/', [controllers.http.Users, 'store'])
          .use(middleware.user({ abilities: ['create'] }))

        router
          .get('/:id', [controllers.http.Users, 'show'])
          .use(middleware.user({ abilities: ['read'] }))

        router
          .patch('/:id', [controllers.http.Users, 'update'])
          .use(middleware.user({ abilities: ['update'] }))

        router
          .delete('/:id', [controllers.http.Users, 'destroy'])
          .use(middleware.user({ abilities: ['delete'] }))
      })
      .prefix('users')
      .as('users')
      .use(middleware.auth())

    router
      .group(() => {
        router
          .get('/', [controllers.http.Gateways, 'index'])
          .use(middleware.gateway({ abilities: ['readAll'] }))

        router
          .patch('/:id/status', [controllers.http.Gateways, 'updateStatus'])
          .use(middleware.gateway({ abilities: ['update'] }))

        router
          .patch('/:id/priority', [controllers.http.Gateways, 'updatePriority'])
          .use(middleware.gateway({ abilities: ['update'] }))
      })
      .prefix('gateways')
      .as('gateways')
      .use(middleware.auth())

    router
      .group(() => {
        router
          .get('/', [controllers.http.Products, 'index'])
          .use(middleware.product({ abilities: ['readAll'] }))

        router
          .post('/', [controllers.http.Products, 'store'])
          .use(middleware.product({ abilities: ['create'] }))

        router
          .get('/:id', [controllers.http.Products, 'show'])
          .use(middleware.product({ abilities: ['read'] }))

        router
          .patch('/:id', [controllers.http.Products, 'update'])
          .use(middleware.product({ abilities: ['update'] }))

        router
          .delete('/:id', [controllers.http.Products, 'destroy'])
          .use(middleware.product({ abilities: ['delete'] }))
      })
      .prefix('products')
      .as('products')
      .use(middleware.auth())

    router.post('purchases', [controllers.http.Purchases, 'store']).as('purchases.store')

    router
      .group(() => {
        router
          .get('/', [controllers.http.Clients, 'index'])
          .use(middleware.client({ abilities: ['readAll'] }))

        router
          .get('/:id', [controllers.http.Clients, 'show'])
          .use(middleware.client({ abilities: ['read'] }))
      })
      .prefix('clients')
      .as('clients')
      .use(middleware.auth())

    router
      .group(() => {
        router
          .get('/', [controllers.http.Transactions, 'index'])
          .use(middleware.transaction({ abilities: ['readAll'] }))

        router
          .get('/:id', [controllers.http.Transactions, 'show'])
          .use(middleware.transaction({ abilities: ['read'] }))

        router
          .post('/:id/refund', [controllers.http.Transactions, 'refund'])
          .use(middleware.transaction({ abilities: ['refund'] }))
      })
      .prefix('transactions')
      .as('transactions')
      .use(middleware.auth())
  })
  .prefix('/api/v1')
