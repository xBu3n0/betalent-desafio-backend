import type ProductEntity from '#domain/entities/shared/product.entity'
import type NewProductEntity from '#domain/entities/transactions/new_product.entity'
import type { ProductId } from '#domain/primitives/transactions/product_id.primitive'

export default abstract class ProductRepositoryInterface {
  abstract list(): Promise<ProductEntity[]>

  abstract findById(id: ProductId): Promise<ProductEntity | null>

  abstract findByIds(ids: ProductId[]): Promise<ProductEntity[]>

  abstract create(newProduct: NewProductEntity): Promise<ProductEntity>

  abstract update(entity: ProductEntity): Promise<ProductEntity>

  abstract delete(id: ProductId): Promise<void>
}
