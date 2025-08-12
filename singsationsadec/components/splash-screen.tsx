import Image from "next/image"

export default function SplashScreen() {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://axgzyeonrt7v.objectstorage.af-johannesburg-1.oci.customer-oci.com/n/axgzyeonrt7v/b/splash-screen/o/splash%2Fsplashbackground.jpg"
          alt="Splash Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="https://axgzyeonrt7v.objectstorage.af-johannesburg-1.oci.customer-oci.com/n/axgzyeonrt7v/b/splash-screen/o/splash%2FSINGSATION-LOGO-ICON.png"
            alt="Sing Sation Logo"
            width={200}
            height={200}
            className="mx-auto"
            priority
          />
        </div>

        {/* Title Text */}
        <h1 className="text-2xl font-bold text-white mb-4 drop-shadow-lg">
          South African Digital Entertainment Competition
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-white drop-shadow-md leading-relaxed">
          Unleash your voice, showcase your talent, and compete with the best!
        </p>

        {/* Loading indicator */}
        <div className="mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    </div>
  )
}
