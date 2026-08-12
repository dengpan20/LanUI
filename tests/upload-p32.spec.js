// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'
import UiUpload from '../src/components/UiUpload.vue'

afterEach(() => { document.body.innerHTML = ''; vi.restoreAllMocks() })

const file = (name, type = 'text/plain', size = 6) => new File([new Uint8Array(size)], name, { type, lastModified: 123 })
const deferred = () => { let resolve; let reject; const promise = new Promise((ok, fail) => { resolve = ok; reject = fail }); return { promise, resolve, reject } }

function harness(props = {}, slots = {}) {
  const model = ref(props.modelValue || [])
  const upload = ref()
  const events = { change: vi.fn(), select: vi.fn(), reject: vi.fn(), exceed: vi.fn(), start: vi.fn(), progress: vi.fn(), success: vi.fn(), uploadError: vi.fn(), abort: vi.fn(), retry: vi.fn(), remove: vi.fn(), error: vi.fn() }
  const wrapper = mount(defineComponent({
    setup: () => () => h(UiConfigProvider, { locale: 'en-US' }, { default: () => h(UiUpload, {
      ref: upload, ...props, modelValue: model.value,
      'onUpdate:modelValue': value => { model.value = value }, onChange: events.change, onSelect: events.select,
      onReject: events.reject, onExceed: events.exceed, onStart: events.start, onProgress: events.progress,
      onSuccess: events.success, onUploadError: events.uploadError, onAbort: events.abort, onRetry: events.retry,
      onRemove: events.remove, onError: events.error,
    }, slots) }),
  }))
  return { wrapper, model, upload, events }
}

describe('P32 production upload queue', () => {
  it('preserves legacy selection while emitting immutable structured change metadata', async () => {
    const { wrapper, model, upload, events } = harness({ multiple: true })
    const selected = await upload.value.select([file('notes.txt')], 'input')
    await nextTick()
    expect(selected).toHaveLength(1)
    expect(model.value[0]).toMatchObject({ name: 'notes.txt', size: 6, sizeText: '6 B', status: 'success', percent: 100 })
    expect(model.value[0].raw).toBeInstanceOf(File)
    expect(events.change).toHaveBeenCalledWith(model.value, expect.objectContaining({ reason: 'select', previous: [], source: 'input' }))
    expect(events.success).toHaveBeenCalledWith(expect.objectContaining({ file: expect.objectContaining({ name: 'notes.txt' }) }))
    expect(wrapper.get('.ui-upload-file').classes()).toContain('status-success')
  })

  it('validates extensions, MIME wildcards, size and maximum count with typed rejection events', async () => {
    const { model, upload, events } = harness({ multiple: true, accept: '.txt,image/*', maxSize: 0.00001, maxCount: 2 })
    await upload.value.select([file('bad.pdf', 'application/pdf'), file('large.txt', 'text/plain', 100), file('photo.png', 'image/png'), file('last.txt')], 'drop')
    await nextTick()
    expect(model.value.map(item => item.name)).toEqual(['photo.png', 'last.txt'])
    expect(events.reject.mock.calls.map(call => call[0].reason)).toEqual(['type', 'size'])
    expect(events.exceed).toHaveBeenCalledWith(expect.objectContaining({ maxCount: 2, remaining: 2 }))
    expect(events.error).toHaveBeenCalled()
  })

  it('supports asynchronous preflight transforms, opt-out and contained preflight failures', async () => {
    const beforeUpload = vi.fn(async input => {
      if (input.name === 'skip.txt') return false
      if (input.name === 'broken.txt') throw new Error('Scanner unavailable')
      return file(`safe-${input.name}`, input.type, input.size)
    })
    const { model, upload, events } = harness({ multiple: true, beforeUpload })
    await upload.value.select([file('draft.txt'), file('skip.txt'), file('broken.txt')])
    expect(model.value.map(item => item.name)).toEqual(['safe-draft.txt'])
    expect(events.reject.mock.calls.map(call => call[0])).toEqual([
      expect.objectContaining({ reason: 'before-upload', message: expect.stringContaining('skip.txt') }),
      expect.objectContaining({ reason: 'before-upload', message: 'Scanner unavailable', error: expect.any(Error) }),
    ])
  })

  it('runs a custom request with progress, response and accessible live queue state', async () => {
    const request = vi.fn(async ({ file: raw, signal, onProgress }) => {
      expect(raw.name).toBe('release.txt'); expect(signal).toBeInstanceOf(AbortSignal)
      onProgress(35); await Promise.resolve(); onProgress(120)
      return { assetId: 'asset-1' }
    })
    const { wrapper, model, upload, events } = harness({ request })
    await upload.value.select([file('release.txt')])
    await flushPromises(); await nextTick()
    expect(request).toHaveBeenCalledOnce()
    expect(model.value[0]).toMatchObject({ status: 'success', percent: 100, response: { assetId: 'asset-1' } })
    expect(events.progress.mock.calls.map(call => call[0].percent)).toEqual([35, 100])
    expect(events.start).toHaveBeenCalledOnce(); expect(events.success).toHaveBeenCalledOnce()
    expect(wrapper.get('.ui-upload-list').attributes('aria-label')).toBe('Upload file list')
    expect(wrapper.get('.ui-upload-status').attributes('aria-hidden')).toBe('true')
    expect(wrapper.get('.ui-upload-file-copy small').text()).toContain('Uploaded')
  })

  it('enforces request concurrency and starts queued work when a slot is released', async () => {
    const jobs = new Map()
    const request = vi.fn(({ file: raw }) => { const job = deferred(); jobs.set(raw.name, job); return job.promise })
    const { model, upload } = harness({ request, multiple: true, concurrency: 2 })
    await upload.value.select([file('one.txt'), file('two.txt'), file('three.txt')])
    await nextTick()
    expect(request).toHaveBeenCalledTimes(2)
    expect(model.value.map(item => item.status)).toEqual(['uploading', 'uploading', 'ready'])
    jobs.get('one.txt').resolve('one-ok'); await flushPromises()
    expect(request).toHaveBeenCalledTimes(3)
    expect(model.value.find(item => item.name === 'three.txt').status).toBe('uploading')
    jobs.get('two.txt').resolve('two-ok'); jobs.get('three.txt').resolve('three-ok'); await flushPromises()
    expect(model.value.every(item => item.status === 'success')).toBe(true)
  })

  it('releases a worker on cancel even when transport ignores abort and rejects stale completion', async () => {
    const first = deferred()
    const request = vi.fn(({ file: raw }) => raw.name === 'cancel.txt' ? first.promise : Promise.resolve('next-success'))
    const { model, upload, events } = harness({ request, multiple: true, concurrency: 1 })
    await upload.value.select([file('cancel.txt'), file('next.txt')]); await nextTick()
    expect(request).toHaveBeenCalledOnce()
    expect(upload.value.abort(model.value[0].id)).toBe(1)
    await flushPromises()
    expect(model.value[0].status).toBe('canceled')
    expect(model.value[1]).toMatchObject({ status: 'success', response: 'next-success' })
    expect(request).toHaveBeenCalledTimes(2)
    first.resolve('late-success'); await flushPromises()
    expect(model.value[0].status).toBe('canceled')
    expect(events.abort).toHaveBeenCalledWith(expect.objectContaining({ reason: 'user' }))
    expect(events.success).toHaveBeenCalledTimes(1)
  })

  it('renders request errors and retries the same stable file entry', async () => {
    let attempt = 0
    const request = vi.fn(async () => { attempt += 1; if (attempt === 1) throw new Error('Network offline'); return 'recovered' })
    const { wrapper, model, upload, events } = harness({ request })
    await upload.value.select([file('retry.txt')]); await flushPromises(); await nextTick()
    expect(model.value[0]).toMatchObject({ status: 'error', error: 'Network offline' })
    expect(wrapper.get('[role="alert"]').text()).toBe('Network offline')
    const id = model.value[0].id
    expect(upload.value.retry(id)).toBe(true)
    await flushPromises(); await nextTick()
    expect(model.value[0]).toMatchObject({ id, status: 'success', response: 'recovered' })
    expect(events.retry).toHaveBeenCalledOnce(); expect(events.uploadError).toHaveBeenCalledOnce()
  })

  it('supports guarded removal and clear while aborting removed requests', async () => {
    const jobs = [deferred(), deferred()]
    const request = vi.fn(() => jobs.shift().promise)
    const beforeRemove = vi.fn(async item => item.name !== 'locked.txt')
    const { model, upload, events } = harness({ request, multiple: true, beforeRemove })
    await upload.value.select([file('locked.txt'), file('remove.txt')]); await nextTick()
    expect(await upload.value.remove(model.value[0].id)).toBe(false)
    expect(await upload.value.remove(model.value[1].id)).toBe(true)
    expect(model.value.map(item => item.name)).toEqual(['locked.txt'])
    expect(events.remove).toHaveBeenCalledWith(expect.objectContaining({ file: expect.objectContaining({ name: 'remove.txt' }) }))
    expect(await upload.value.clear()).toBe(0)
  })

  it('supports manual queues, custom trigger/file/tip slots and public controls', async () => {
    const request = vi.fn(async () => 'ok')
    const { wrapper, model, upload } = harness({ request, autoUpload: false }, {
      trigger: ({ remaining }) => h('span', { 'data-trigger': '' }, `Remaining ${remaining}`),
      tip: ({ busy }) => h('span', { 'data-tip': '' }, String(busy)),
      file: ({ file: item, upload: start }) => h('button', { 'data-file': '', onClick: () => start(item.id) }, `${item.name}:${item.status}`),
    })
    await upload.value.select([file('manual.txt')]); await nextTick()
    expect(request).not.toHaveBeenCalled(); expect(model.value[0].status).toBe('ready')
    expect(wrapper.get('[data-trigger]').text()).toBe('Remaining 4')
    expect(wrapper.get('[data-file]').text()).toBe('manual.txt:ready')
    await wrapper.get('[data-file]').trigger('click'); await flushPromises(); await nextTick()
    expect(model.value[0].status).toBe('success'); expect(request).toHaveBeenCalledOnce()
  })

  it('renders deterministic SSR markup without touching browser-only file APIs', async () => {
    const render = () => renderToString(h(UiConfigProvider, { locale: 'en-US' }, { default: () => h(UiUpload, {
      ariaLabel: 'Release assets', modelValue: [{ id: 'server-file', name: 'manifest.json', size: 24, status: 'ready', percent: 0 }],
    }) }))
    const first = await render(); const second = await render()
    expect(first).toBe(second)
    expect(first).toContain('aria-label="Release assets"')
    expect(first).toContain('manifest.json')
    expect(first).toContain('Ready')
  })
})
