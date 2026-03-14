import ProductEntity from '#domain/entities/shared/product.entity'
import type NewProductEntity from '#domain/entities/transactions/new_product.entity'
import type { ProductId } from '#domain/primitives/transactions/product_id.primitive'
import type ProductRepositoryInterface from '#repositories/transactions/product.repository'
import Product from '#models/transactions/product'

export default class LucidProductRepository implements ProductRepositoryInterface {
  async list() {
    const products = await Product.query().orderBy('name', 'asc')
    return products.map((product) =>
      ProductEntity.fromRecord({
        id: product.id,
        name: product.name,
        amount: product.amount,
      })
    )
  }

  async findById(id: ProductId) {
    const product = await Product.find(id.value)
    if (!product) {
      return null
    }

    return ProductEntity.fromRecord({
      id: product.id,
      name: product.name,
      amount: product.amount,
    })
  }

  async findByIds(ids: ProductId[]) {
    if (ids.length === 0) {
      return []
    }

    const uniqueIds = [...new Set(ids.map((id) => id.value))]
    const products = await Product.query().whereIn('id', uniqueIds)
    return products.map((product) =>
      ProductEntity.fromRecord({
        id: product.id,
        name: product.name,
        amount: product.amount,
      })
    )
  }

  async create(newProduct: NewProductEntity) {
    const product = await Product.create({
      name: newProduct.name.value,
      amount: newProduct.amount.value,
    })

    return ProductEntity.fromRecord({
      id: product.id,
      name: product.name,
      amount: product.amount,
    })
  }

  async update(entity: ProductEntity) {
    const product = await Product.findOrFail(entity.id.value)

    product.name = entity.name.value
    product.amount = entity.amount.value

    await product.save()

    return ProductEntity.fromRecord({
      id: product.id,
      name: product.name,
      amount: product.amount,
    })
  }

  async delete(id: ProductId) {
    const product = await Product.findOrFail(id.value)
    await product.delete()
  }
}
