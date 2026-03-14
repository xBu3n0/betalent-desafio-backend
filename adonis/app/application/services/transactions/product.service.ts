import { inject } from '@adonisjs/core'
import ProductRepositoryInterface from '#repositories/transactions/product.repository'
import ProductNotFoundException from '#domain/exceptions/transactions/product_not_found.exception'
import ProductEntity from '#domain/entities/shared/product.entity'
import NewProductEntity from '#domain/entities/transactions/new_product.entity'
import { ProductAmount } from '#domain/primitives/transactions/product_amount.primitive'
import { ProductId } from '#domain/primitives/transactions/product_id.primitive'
import { ProductName } from '#domain/primitives/transactions/product_name.primitive'

export interface CreateProductInput {
  name: string
  amount: number
}

export interface UpdateProductInput {
  name?: string
  amount?: number
}

@inject()
export default class ProductService {
  constructor(private readonly productRepository: ProductRepositoryInterface) {}

  async listProducts() {
    return this.productRepository.list()
  }

  async create(input: CreateProductInput) {
    const product = NewProductEntity.create(
      ProductName.create(input.name),
      ProductAmount.create(input.amount)
    )

    return this.productRepository.create(product)
  }

  async getById(id: number) {
    const productId = ProductId.create(id)
    return this.ensureExists(productId)
  }

  async update(id: number, input: UpdateProductInput) {
    const product = await this.ensureExists(ProductId.create(id))

    let updated: ProductEntity = product

    if (input.name) {
      updated = updated.changeName(ProductName.create(input.name))
    }

    if (typeof input.amount === 'number') {
      updated = updated.changeAmount(ProductAmount.create(input.amount))
    }

    return this.productRepository.update(updated)
  }

  async delete(id: number) {
    const productId = ProductId.create(id)
    await this.ensureExists(productId)
    await this.productRepository.delete(productId)
  }

  private async ensureExists(id: ProductId) {
    const product = await this.productRepository.findById(id)
    if (!product) {
      throw new ProductNotFoundException(`Product '${id.value}' was not found.`)
    }

    return product
  }
}
