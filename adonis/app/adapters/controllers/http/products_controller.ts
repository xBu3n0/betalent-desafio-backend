import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import ProductService from '#services/transactions/product.service'
import ProductTransformer from '#transformers/product_transformer'
import { createProductValidator, updateProductValidator } from '#validators/product'

@inject()
export default class ProductsController {
  constructor(private readonly productService: ProductService) {}

  /**
   * @index
   * @summary List products
   * @tag Products
   * @responseBody 200 - <ProductCollectionResponse>
   * @responseBody 401 - <ErrorResponse>
   * @responseBody 403 - <ErrorResponse>
   */
  async index({ serialize }: HttpContext) {
    const products = await this.productService.listProducts()

    return serialize(ProductTransformer.transform(products))
  }

  /**
   * @store
   * @summary Create a product
   * @tag Products
   * @requestBody <createProductValidator>
   * @responseBody 200 - <ProductResponse>
   * @responseBody 401 - <ErrorResponse>
   * @responseBody 403 - <ErrorResponse>
   * @responseBody 422 - <ErrorResponse>
   */
  async store({ request, serialize }: HttpContext) {
    const payload = await request.validateUsing(createProductValidator)
    const product = await this.productService.create(payload)

    return serialize(ProductTransformer.transform(product))
  }

  /**
   * @show
   * @summary Show a product by id
   * @tag Products
   * @paramPath id - Product id - @type(number) @required
   * @responseBody 200 - <ProductResponse>
   * @responseBody 401 - <ErrorResponse>
   * @responseBody 403 - <ErrorResponse>
   * @responseBody 404 - <ErrorResponse>
   */
  async show({ params, serialize }: HttpContext) {
    const product = await this.productService.getById(Number(params.id))

    return serialize(ProductTransformer.transform(product))
  }

  /**
   * @update
   * @summary Update a product by id
   * @tag Products
   * @paramPath id - Product id - @type(number) @required
   * @requestBody <updateProductValidator>
   * @responseBody 200 - <ProductResponse>
   * @responseBody 401 - <ErrorResponse>
   * @responseBody 403 - <ErrorResponse>
   * @responseBody 404 - <ErrorResponse>
   * @responseBody 422 - <ErrorResponse>
   */
  async update({ params, request, serialize }: HttpContext) {
    const payload = await request.validateUsing(updateProductValidator)
    const product = await this.productService.update(Number(params.id), payload)

    return serialize(ProductTransformer.transform(product))
  }

  /**
   * @destroy
   * @summary Delete a product by id
   * @tag Products
   * @paramPath id - Product id - @type(number) @required
   * @responseBody 200 - <MessageResponse>
   * @responseBody 401 - <ErrorResponse>
   * @responseBody 403 - <ErrorResponse>
   * @responseBody 404 - <ErrorResponse>
   */
  async destroy({ params }: HttpContext) {
    await this.productService.delete(Number(params.id))

    return {
      message: 'Product removed successfully',
    }
  }
}
