const { describe, it } = require('node:test');
const assert = require('node:assert');

describe('Products & Categories Query Module', () => {
  it('builds category and search query filters properly', () => {
    const buildFilter = ({ search = '', category = '', includeInactive = false }) => {
      const filter = {};
      if (!includeInactive) {
        filter.isActive = { $ne: false };
      }
      if (category && category !== 'All') {
        filter.category = category;
      }
      if (search && search.trim()) {
        const term = search.trim();
        filter.$or = [
          { name: { $regex: term, $options: 'i' } },
          { brand: { $regex: term, $options: 'i' } },
          { description: { $regex: term, $options: 'i' } },
          { tags: { $regex: term, $options: 'i' } },
          { sku: { $regex: term, $options: 'i' } },
        ];
      }
      return filter;
    };

    const filter1 = buildFilter({ category: 'Appliances', search: 'Blender' });
    assert.strictEqual(filter1.category, 'Appliances');
    assert.strictEqual(filter1.isActive.$ne, false);
    assert.strictEqual(Array.isArray(filter1.$or), true);
    assert.strictEqual(filter1.$or.length, 5);

    const filter2 = buildFilter({ category: 'All', search: '' });
    assert.strictEqual(filter2.category, undefined);
    assert.strictEqual(filter2.$or, undefined);
  });

  it('calculates pagination limits and offsets accurately', () => {
    const paginate = (page, limit, total) => {
      const currentPage = Math.max(1, Number(page) || 1);
      const pageSize = Math.min(100, Math.max(1, Number(limit) || 24));
      const skip = (currentPage - 1) * pageSize;
      const totalPages = Math.ceil(total / pageSize);
      return { page: currentPage, limit: pageSize, skip, total, totalPages };
    };

    const p1 = paginate(1, 24, 50);
    assert.strictEqual(p1.page, 1);
    assert.strictEqual(p1.skip, 0);
    assert.strictEqual(p1.totalPages, 3);

    const p2 = paginate(2, 20, 45);
    assert.strictEqual(p2.page, 2);
    assert.strictEqual(p2.skip, 20);
    assert.strictEqual(p2.totalPages, 3);

    const p3 = paginate(-1, 0, 10);
    assert.strictEqual(p3.page, 1);
    assert.strictEqual(p3.limit, 24);
  });
});

