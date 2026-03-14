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

router.get('/', () => {
  return { hello: 'world' }
})

router
  .group(() => {
    router
      .group(() => {
        router.post('signup', [controllers.http.NewAccount, 'store'])
        router.post('login', [controllers.http.AccessToken, 'store'])
        router.post('logout', [controllers.http.AccessToken, 'destroy']).use(middleware.auth())
      })
      .prefix('auth')
      .as('auth')

    router
      .group(() => {
        router.get('/profile', [controllers.http.Profile, 'show'])
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
  })
  .prefix('/api/v1')
