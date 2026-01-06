import { NextRequest, NextResponse } from 'next/server'

// Detect country from IP address
export async function GET(request: NextRequest) {
  try {
    // Try to get country from Vercel/Cloudflare headers first
    const country = request.headers.get('x-vercel-ip-country') || 
                   request.headers.get('cf-ipcountry') || 
                   request.headers.get('x-country-code')
    
    if (country && country.length === 2) {
      console.log('🌍 Country from headers:', country)
      return NextResponse.json({ country: country.toUpperCase() })
    }
    
    // Get client IP address
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : 
               request.headers.get('x-real-ip') || 
               request.headers.get('x-client-ip') ||
               '8.8.8.8'
    
    console.log('🔍 Detecting country for IP:', ip)
    
    // Try ipapi.co first (free, no API key needed)
    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.country_code && data.country_code.length === 2) {
          console.log('✅ Country detected:', data.country_code)
          return NextResponse.json({ country: data.country_code.toUpperCase() })
        }
      }
    } catch (e) {
      console.log('⚠️  ipapi.co failed, trying alternative...')
    }
    
    // Fallback: Try ip-api.com (free, no API key)
    try {
      const response = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.countryCode && data.countryCode.length === 2) {
          console.log('✅ Country detected (fallback):', data.countryCode)
          return NextResponse.json({ country: data.countryCode.toUpperCase() })
        }
      }
    } catch (e) {
      console.log('⚠️  ip-api.com also failed')
    }
    
    console.log('⚠️  Using default country: US')
    return NextResponse.json({ country: 'US' })
  } catch (error) {
    console.error('❌ Error detecting country:', error)
    return NextResponse.json({ country: 'US' })
  }
}
