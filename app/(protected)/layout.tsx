import { Navigation } from '@/components/navigation'
import { AuthGuard } from '@/components/auth-guard'
import { VolumeScrollbar } from '@/components/ui/volume-scrollbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="h-screen h-[100dvh] flex flex-col md:flex-row overflow-hidden bg-background">
        <Navigation />
        <main className="flex-1 min-h-0 relative z-10">
          <VolumeScrollbar>
            <div className="px-4 sm:px-6 lg:px-8 py-4 md:py-12 pb-12 md:pb-12">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </div>
          </VolumeScrollbar>
        </main>
      </div>
    </AuthGuard>
  )
}
