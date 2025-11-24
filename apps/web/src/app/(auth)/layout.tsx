import React from 'react'

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image/Content */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2000&auto=format&fit=crop')`,
          }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center justify-center w-full p-12 relative z-10">
          <div className="max-w-md text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-white leading-tight drop-shadow-lg">
                Wedding Invitation Platform
              </h1>
              <p className="text-sm text-white/90 leading-relaxed drop-shadow-md">
                Create beautiful Cambodian wedding invitations and manage your events with ease
              </p>
            </div>

            {/* Feature Cards */}
            <div className="mt-10 grid grid-cols-2 gap-3 text-xs">
              <div className="p-4 backdrop-blur-md rounded-lg border border-white/30 shadow-lg hover:shadow-xl transition-all">
                <p className="font-semibold text-white mb-1.5 drop-shadow-md">
                  Event Management
                </p>
                <p className="text-white/90 text-[11px] drop-shadow-sm">
                  Organize your wedding events
                </p>
              </div>
              <div className="p-4 backdrop-blur-md rounded-lg border border-white/30 shadow-lg hover:shadow-xl transition-all">
                <p className="font-semibold text-white mb-1.5 drop-shadow-md">
                  Guest Tracking
                </p>
                <p className="text-white/90 text-[11px] drop-shadow-sm">
                  Manage your guest list
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-4 py-8 lg:bg-white relative overflow-hidden">
        {/* Pattern Background */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v22H20v-1.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2z'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '40px 40px',
            }}
          ></div>
        </div>

        <div className="max-w-md w-full relative z-10">{children}</div>
      </div>
    </div>
  )
}
export default AuthLayout
