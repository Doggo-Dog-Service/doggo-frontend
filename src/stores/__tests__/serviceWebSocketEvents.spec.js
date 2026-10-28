import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const svc = vi.hoisted(() => ({ getServiceEvents: vi.fn(), postServiceEvent: vi.fn(), getService: vi.fn() }))
const media = vi.hoisted(() => ({ postImage: vi.fn() }))
const notify = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }))

vi.mock('@/services/service', () => svc)
vi.mock('@/composables/useMedia', () => ({ useMedia: () => media }))
vi.mock('@/utils/notify', () => ({ default: notify }))

import { useServiceWebSocketStore } from '../serviceWebSocket'

const ev = (id, extra = {}) => ({ id, kind: 'pee', latitude: 1, longitude: 2, image_url: null, created_at: 'x', ...extra })

describe('serviceWebSocket events', () => {
  let store
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    store = useServiceWebSocketStore()
    store.setService({ id: 7, status: 3 })
  })

  it('loadEvents fills list; WS event after GET does not duplicate', async () => {
    svc.getServiceEvents.mockResolvedValue([ev(1), ev(2)])
    await store.loadEvents()
    expect(svc.getServiceEvents).toHaveBeenCalledWith(7)
    store.handleWalkEvent({ service_id: 7, event: ev(2) })
    store.handleWalkEvent({ service_id: 7, event: ev(3, { kind: 'poop' }) })
    expect(store.events.map((e) => e.id)).toEqual([1, 2, 3])
  })

  it('ignores WS event of another service', () => {
    store.handleWalkEvent({ service_id: 99, event: ev(1) })
    expect(store.events).toEqual([])
  })

  it('addEvent posts current position', async () => {
    store.updateLocation({ latitude: -26.3, longitude: -48.8 }, 10)
    svc.postServiceEvent.mockResolvedValue(ev(5, { kind: 'water' }))
    await store.addEvent('water')
    expect(svc.postServiceEvent).toHaveBeenCalledWith(7, { kind: 'water', latitude: -26.3, longitude: -48.8 })
    expect(store.events.map((e) => e.id)).toEqual([5])
    store.handleWalkEvent({ service_id: 7, event: ev(5) })
    expect(store.events).toHaveLength(1)
  })

  it('addEvent without GPS sends no coordinates', async () => {
    svc.postServiceEvent.mockResolvedValue(ev(6))
    await store.addEvent('pee')
    expect(svc.postServiceEvent).toHaveBeenCalledWith(7, { kind: 'pee' })
  })

  it('photo uploads image then posts attachment key', async () => {
    media.postImage.mockResolvedValue({ attachment_key: 'k1' })
    svc.postServiceEvent.mockResolvedValue(ev(8, { kind: 'photo', image_url: 'u' }))
    const file = new File(['a'], 'a.jpg')
    await store.addEvent('photo', file)
    expect(media.postImage).toHaveBeenCalledWith({ file, description: 'Foto do passeio' })
    expect(svc.postServiceEvent).toHaveBeenCalledWith(7, { kind: 'photo', image_attachment_key: 'k1' })
    expect(store.events[0].id).toBe(8)
  })

  it('photo upload failure posts nothing', async () => {
    media.postImage.mockResolvedValue(undefined)
    await store.addEvent('photo', new File(['a'], 'a.jpg'))
    expect(svc.postServiceEvent).not.toHaveBeenCalled()
  })

  it('409 shows server message', async () => {
    svc.postServiceEvent.mockRejectedValue({ message: 'Limite de 3 fotos por passeio.', status: 409 })
    media.postImage.mockResolvedValue({ attachment_key: 'k' })
    const res = await store.addEvent('photo', new File(['a'], 'a.jpg'))
    expect(notify.error).toHaveBeenCalledWith('Limite de 3 fotos por passeio.')
    expect(res).toBeNull()
    expect(store.events).toEqual([])
  })

  it('clears events when service changes', async () => {
    store.handleWalkEvent({ service_id: 7, event: ev(1) })
    svc.getService.mockResolvedValue({ id: 8, status: 3 })
    await store.getService(8)
    expect(store.events).toEqual([])
  })
})

describe('serviceWebSocket saveNote', () => {
  it('patches provider_note and updates the service', async () => {
    setActivePinia(createPinia())
    svc.patchServiceNote = vi.fn().mockResolvedValue({ id: 7, status: 3, provider_note: 'Tudo bem' })
    const store = useServiceWebSocketStore()
    store.setService({ id: 7, status: 3 })
    await store.saveNote('Tudo bem')
    expect(svc.patchServiceNote).toHaveBeenCalledWith(7, { provider_note: 'Tudo bem' })
    expect(store.providerNote).toBe('Tudo bem')
  })
})
