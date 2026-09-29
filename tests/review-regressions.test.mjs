import assert from 'node:assert/strict'
import { test, before, after } from 'node:test'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { parseHoursRow, isValidHoursRow } from '../src/utils/openingHours.ts'
import { loadAllPages } from '../src/utils/loadAllPages.ts'
import { runBatch } from '../src/utils/runBatch.ts'
import { getErrorMessage } from '../src/utils/getErrorMessage.ts'

test('hours accept all supported separators and normalize single-digit hours', () => {
  for (const separator of ['-', '–', '—']) {
    assert.deepEqual(parseHoursRow(`9:00 ${separator} 22:00`), {
      start: '09:00',
      end: '22:00',
    })
  }
  assert.deepEqual(parseHoursRow('22:00-2:00'), {
    start: '22:00',
    end: '02:00',
  })
  assert.deepEqual(parseHoursRow('09:00:00-22:00:00'), {
    start: '09:00:00',
    end: '22:00:00',
  })
  assert.equal(isValidHoursRow('  '), true)
})

test('invalid hours cannot silently become days off', () => {
  for (const value of [
    'abc-def',
    '99:00-88:00',
    '9:60-22:00',
    '24:00-22:00',
    '9:00',
    '9:00--22:00',
    '-9:00-22:00',
    '9:00-22:00-',
    '9:00:61-22:00',
  ]) {
    assert.equal(isValidHoursRow(value), false, value)
  }
})

test('pagination reads beyond 200 items and never returns a partial success', async () => {
  const calls = []
  const items = await loadAllPages(async (page) => {
    calls.push(page)
    return {
      totalPages: 3,
      content: Array.from(
        { length: page === 2 ? 1 : 100 },
        (_, i) => page * 100 + i,
      ),
    }
  })
  assert.equal(items.length, 201)
  assert.equal(items.at(-1), 200)
  assert.deepEqual(calls, [0, 1, 2])
  assert.deepEqual(
    await loadAllPages(async () => ({ totalPages: 0, content: [] })),
    [],
  )
  await assert.rejects(
    loadAllPages(async (page) => {
      if (page === 1) throw Error('offline')
      return { totalPages: 2, content: [1] }
    }),
    /offline/,
  )
})

test('batch starts every action before waiting and retains only failed IDs', async () => {
  const started = []
  const completions = []
  const pending = runBatch([1, 2, 3], (id) => {
    started.push(id)
    return new Promise((resolve, reject) =>
      completions.push({ resolve, reject }),
    )
  })
  await Promise.resolve()
  assert.deepEqual(started, [1, 2, 3])
  completions[2].resolve()
  completions[0].resolve()
  completions[1].reject(Error('denied'))
  assert.deepEqual(await pending, { succeeded: [1, 3], failed: [2] })
  assert.deepEqual(
    await runBatch([1], () => {
      throw Error('sync failure')
    }),
    { succeeded: [], failed: [1] },
  )
})

test('error messages preserve server text, status fallbacks and caller defaults', () => {
  const error = (status, data) => ({
    isAxiosError: true,
    response: { status, data },
  })
  assert.equal(
    getErrorMessage(error(404, {}), 'default', { 404: 'Not found' }),
    'Not found',
  )
  assert.equal(
    getErrorMessage(error(404, { message: 'Specific error' }), 'default', {
      404: 'Not found',
    }),
    'Specific error',
  )
  assert.equal(
    getErrorMessage(error(400, 'Bad request'), 'default'),
    'Bad request',
  )
  assert.equal(getErrorMessage(null, 'default'), 'default')
  assert.equal(getErrorMessage(new Error('Unavailable')), 'Unavailable')
})

let server, api, owners, edits, hours, dishes, clients, orders
test('filtered dish lists hide tabs when empty and select a category containing dishes', async () => {
  const { default: DishCategoryList } = await server.ssrLoadModule(
    '/src/pages/owner/components/DishCategoryList/DishCategoryList.tsx',
  )
  const props = {
    categories: [
      { id: 2, name: 'Second kitchen', sort: 2 },
      { id: 1, name: 'First kitchen', sort: 1 },
    ],
    toggleLabel: () => 'Restore',
    isToggleOn: () => false,
    onToggle: () => {},
    togglingId: null,
    onEdit: () => {},
  }
  for (const emptyMessage of ['No deleted dishes.', 'No dishes on hold.']) {
    const empty = renderToStaticMarkup(
      createElement(DishCategoryList, {
        ...props,
        dishes: [],
        emptyMessage,
      }),
    )
    assert.ok(empty.includes(emptyMessage))
    assert.ok(!empty.includes('<button'))
    const populated = renderToStaticMarkup(
      createElement(DishCategoryList, {
        ...props,
        emptyMessage,
        dishes: [
          {
            id: 10,
            dishCategoryId: 2,
            title: 'Existing dish',
            price: 8000,
            isActive: false,
          },
        ],
      }),
    )
    assert.ok(populated.includes('<h2>Second kitchen</h2>'))
    assert.ok(populated.includes('Existing dish'))
    assert.ok(!populated.includes(emptyMessage))
    assert.match(populated, /aria-pressed="true"[^>]*>Second kitchen/)
  }
})
before(async () => {
  globalThis.localStorage = { getItem: () => null }
  server = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  })
  ;({ api } = await server.ssrLoadModule('/src/services/api.ts'))
  owners = await server.ssrLoadModule('/src/services/ownerRestaurantService.ts')
  edits = await server.ssrLoadModule(
    '/src/services/ownerEditRestaurantService.ts',
  )
  hours = await server.ssrLoadModule(
    '/src/services/ownerOperatingHoursService.ts',
  )
  dishes = await server.ssrLoadModule('/src/services/ownerDishService.ts')
  clients = await server.ssrLoadModule('/src/services/clientService.ts')
  orders = await server.ssrLoadModule('/src/services/ownerOrderService.ts')
})
after(async () => {
  await server?.close()
  delete globalThis.localStorage
})
function mockApi(handler) {
  api.defaults.adapter = async (config) => ({
    data: await handler(config),
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  })
}

test('admin menu includes inactive dishes after the first global pages', async () => {
  const adminDishes = await server.ssrLoadModule(
    '/src/services/adminDishService.ts',
  )
  mockApi((config) => {
    assert.equal(config.url, '/admin/dishes')
    const page = config.params.page
    return {
      totalPages: 3,
      content:
        page < 2
          ? Array.from({ length: 100 }, (_, index) => ({
              id: page * 100 + index,
              restaurantId: 1,
              isActive: true,
            }))
          : [{ id: 201, restaurantId: 39, isActive: false }],
    }
  })
  assert.deepEqual(await adminDishes.getAllAdminDishesForRestaurant(39), [
    { id: 201, restaurantId: 39, isActive: false },
  ])
})

test('pagination keeps a bounded button count for a thousand pages', async () => {
  const { default: Pagination } = await server.ssrLoadModule(
    '/src/components/Pagination/Pagination.tsx',
  )
  for (const page of [0, 500, 999]) {
    const html = renderToStaticMarkup(
      createElement(Pagination, {
        page,
        totalPages: 1000,
        disabled: true,
        onPageChange() {},
      }),
    )
    assert.ok((html.match(/<button/g) ?? []).length <= 9)
    assert.ok(html.includes('>1000</button>'))
    assert.equal(
      (html.match(/disabled=""/g) ?? []).length,
      (html.match(/<button/g) ?? []).length,
    )
  }
})

test('owner dishes use only the restaurant endpoint and load all pages', async () => {
  const calls = []
  mockApi((config) => {
    calls.push(config.url)
    assert.equal(config.url, '/dishes/restaurant/39')
    return {
      totalPages: 3,
      content: [{ id: config.params.page, restaurantId: 39 }],
    }
  })
  assert.equal((await dishes.getOwnerDishes(39)).length, 3)
  assert.equal(calls.length, 3)
  await assert.rejects(
    dishes.getOwnerDishes(39, 'inactive'),
    /currently unavailable/,
  )
  await assert.rejects(
    dishes.getOwnerDishes(39, 'deleted'),
    /currently unavailable/,
  )
  assert.equal(calls.length, 3)
})

test('restaurant editing shares the cache; schedule writes invalidate it', async () => {
  owners.invalidateOwnerRestaurantsCache()
  let reads = 0
  mockApi((config) => {
    if (config.method === 'get') {
      reads++
      return [{ id: 39 }]
    }
    return []
  })
  await Promise.all([
    owners.getOwnerRestaurants(1),
    edits.getOwnerRestaurants(1),
  ])
  assert.equal(reads, 1)
  await hours.updateOwnerOperatingMode(39, 1, {
    dayOfWeek: 1,
    dayOff: false,
    start: '09:00',
    end: '22:00',
  })
  await owners.getOwnerRestaurants(1)
  assert.equal(reads, 2)
  await hours.deleteOwnerOperatingMode(39, 1)
  await owners.getOwnerRestaurants(1)
  assert.equal(reads, 3)
})

test('failed old request cannot evict a newer cache entry', async () => {
  owners.invalidateOwnerRestaurantsCache()
  let rejectOld,
    reads = 0
  mockApi(() => {
    reads++
    if (reads === 1)
      return new Promise((_, reject) => {
        rejectOld = reject
      })
    return [{ id: 39 }]
  })
  const old = owners.getOwnerRestaurants(1)
  const rejected = assert.rejects(old, /old failure/)
  await new Promise((resolve) => setImmediate(resolve))
  owners.invalidateOwnerRestaurantsCache()
  await owners.getOwnerRestaurants(1)
  rejectOld(Error('old failure'))
  await rejected
  await owners.getOwnerRestaurants(1)
  assert.equal(reads, 2)
})

test('client actions and cooking time use the documented methods and payloads', async () => {
  const calls = []
  mockApi((config) => {
    calls.push([config.method, config.url, config.data])
    return {}
  })
  await clients.blockClient(4)
  await clients.unblockClient(4)
  await clients.deleteClient(4)
  await orders.updateOrderCookingTime(8, 35)
  assert.deepEqual(
    calls.map(([method, url]) => [method, url]),
    [
      ['patch', '/admin/clients/4/block'],
      ['patch', '/admin/clients/4/unblock'],
      ['delete', '/admin/clients/4'],
      ['put', '/orders/8'],
    ],
  )
  assert.deepEqual(JSON.parse(calls[3][2]), { cookingTime: 35 })
})
