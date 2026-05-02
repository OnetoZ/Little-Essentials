import PropTypes from 'prop-types'
import ProductCard from './ProductCard'
import ProductCardSkeleton from './ProductCardSkeleton'

const GRID_COLUMNS = {
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
}

export default function ProductGrid({
  products,
  loading = false,
  skeletonCount = 8,
  editorial = false,
  columns = 4,
}) {
  if (loading) {
    return (
      <div
        className={`grid grid-cols-2 gap-4 md:grid-cols-3 ${GRID_COLUMNS[columns] ?? GRID_COLUMNS[4]} lg:gap-5`}
      >
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (editorial) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-5">
          {products.slice(0, 3).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {products.length > 3 ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr] lg:gap-5">
            {products.slice(3, 5).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}

        {products.length > 5 ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
            {products.slice(5, 9).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}

        {products.length > 9 ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-5">
            {products.slice(9).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div
      className={`grid grid-cols-2 gap-4 md:grid-cols-3 ${GRID_COLUMNS[columns] ?? GRID_COLUMNS[4]} lg:gap-5`}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

ProductGrid.propTypes = {
  columns: PropTypes.oneOf([2, 3, 4]),
  editorial: PropTypes.bool,
  loading: PropTypes.bool,
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
    }),
  ).isRequired,
  skeletonCount: PropTypes.number,
}
