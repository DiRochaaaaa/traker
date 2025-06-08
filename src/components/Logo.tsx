import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  className?: string
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center justify-center w-full ${className}`}>
      <div className="relative w-64 h-16 md:w-72 md:h-20">
        <Image
          src="/images/logo.png"
          alt="Falcon Tracker Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
    </Link>
  )
} 