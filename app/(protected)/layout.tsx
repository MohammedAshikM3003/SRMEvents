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
      <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-background">
        <Navigation />
        <main className="flex-1 h-full relative z-10">
          <VolumeScrollbar>
            <div className="px-4 sm:px-6 lg:px-8 py-8 md:py-12">
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
