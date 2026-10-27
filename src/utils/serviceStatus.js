import { Ban, CalendarCheck, CheckCircle2, Clock, Footprints, XCircle } from 'lucide-vue-next'

export const serviceStatus = [
  { id: 1, name: 'Em Análise', color: 'yellow'},
  { id: 2, name: 'Confirmado', color: 'blue' },
  { id: 3, name: 'Em Andamento', color: 'blue' },
  { id: 4, name: 'Concluído', color: 'green' },
  { id: 5, name: 'Cancelado', color: 'red' },
  { id: 6, name: 'Recusado', color: 'red' },
]

export const STATUS_META = {
  1: { label: 'Em análise', tone: 'warning', icon: Clock },
  2: { label: 'Confirmado', tone: 'info', icon: CalendarCheck },
  3: { label: 'Em andamento', tone: 'brand', icon: Footprints },
  4: { label: 'Concluído', tone: 'success', icon: CheckCircle2 },
  5: { label: 'Cancelado', tone: 'neutral', icon: XCircle },
  6: { label: 'Recusado', tone: 'danger', icon: Ban },
}
