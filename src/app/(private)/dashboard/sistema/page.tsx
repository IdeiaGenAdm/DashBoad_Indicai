import { MaintenanceToggle } from '@/components/features/sistema/maintenance-toggle'

export default function SistemaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sistema</h1>
        <p className="text-muted-foreground">Configurações e manutenção do sistema.</p>
      </div>
      <MaintenanceToggle />
    </div>
  )
}
