'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CurrencySelector from './CurrencySelector'

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isPagesDropdownOpen, setIsPagesDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/store' },
    { name: 'Tracksuits', href: '/tracksuits' },
    { name: 'Jackets', href: '/jackets' },
    { name: 'Shorts', href: '/shorts' },
    { name: 'T-Shirt', href: '/t-shirts' },
    { name: 'Bags', href: '/bags' },
    { name: 'Hoodie', href: '/hoodies' },
  ]

  const pagesLinks = [
    { name: 'Authenticity Service', href: '/authenticity-service' },
    { name: 'Size Guides', href: '/size-guides' },
    { name: 'FAQs', href: '/faqs' },
    { name: 'Customer Care', href: '/customer-care' },
    { name: 'Return & Exchange', href: '/return-exchange' },
    { name: 'Shipping Policy', href: '/shipping-policy' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'About Us', href: '/about-us' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-black border-b border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <img 
                src="/trapstar-logo.png" 
                alt="Trapstar Official"
                className="h-12 w-auto object-contain"
                style={{ 
                  maxWidth: '150px',
                  filter: 'brightness(0) invert(1)' // Convert black logo to white
                }}
                onError={(e) => {
                  // Fallback chain: trapstar-logo.png -> trapstar-logo.svg -> new.avif -> trapstar.webp
                  const target = e.target as HTMLImageElement
                  if (target.src.includes('trapstar-logo.png')) {
                    target.src = '/trapstar-logo.svg'
                  } else if (target.src.includes('trapstar-logo.svg')) {
                    target.src = '/new.avif'
                  } else if (target.src.includes('new.avif')) {
                    target.src = '/trapstar.webp'
                  }
                }}
              />
            </Link>
          </div>

          {/* Navigation Links - Hidden on mobile, visible on desktop */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
              >
                {link.name}
              </Link>
            ))}
            
            {/* Pages Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsPagesDropdownOpen(true)}
              onMouseLeave={() => setIsPagesDropdownOpen(false)}
            >
              <Link
                href="/pages"
                className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium flex items-center gap-1"
              >
                Pages
                <svg 
                  className={`w-4 h-4 transition-transform ${isPagesDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              
              {/* Dropdown Menu */}
              {isPagesDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-black border border-gray-800 rounded-lg shadow-xl z-50">
                  <div className="py-2">
                    {pagesLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-900 hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    ))}
                    <div className="border-t border-gray-800 mt-2 pt-2">
                      <Link
                        href="/pages"
                        className="block px-4 py-2 text-sm text-white font-semibold hover:bg-gray-900 transition-colors"
                      >
                        View All Pages →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            {/* Currency/Country Selector */}
            <CurrencySelector />
            
            {/* Search */}
            <div className="relative">
              {isSearchOpen ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
                        setIsSearchOpen(false)
                        setSearchQuery('')
                      }
                    }}
                    placeholder="Search products..."
                    className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm w-48 focus:outline-none focus:ring-2 focus:ring-white"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      if (searchQuery.trim()) {
                        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
                      }
                      setIsSearchOpen(false)
                      setSearchQuery('')
                    }}
                    className="text-gray-400 hover:text-white"
                    aria-label="Search"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setIsSearchOpen(false)
                      setSearchQuery('')
                    }}
                    className="text-gray-400 hover:text-white"
                    aria-label="Close search"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-400 hover:text-white" 
              aria-label="Menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-900 mt-2 pt-4">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium py-2"
                >
                  {link.name}
                </Link>
              ))}
              
              {/* Mobile Pages Section */}
              <div className="pt-4 border-t border-gray-900 mt-2">
                <Link
                  href="/pages"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white font-semibold text-sm py-2 block"
                >
                  Pages
                </Link>
                <div className="pl-4 mt-2 space-y-2">
                  {pagesLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm py-1 block"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
