'use client'


export function Footer() {

  return (
    <>
      <footer className="bg-transparent absolute bottom-0 left-0 right-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center">
            {/* Copyright Text */}
            <p className="text-sm text-white text-center">
              © រក្សាសិទ្ធិ 2024 ~ {new Date().getFullYear()} - ដំណើរការដោយ PHKASLA
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Footer
