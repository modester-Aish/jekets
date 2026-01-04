import Script from 'next/script'

export default function StructuredData() {
  const siteNavigationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    name: 'Main Navigation',
    url: 'https://trapstarofficial.store',
    hasPart: [
      {
        '@type': 'SiteNavigationElement',
        name: 'Home',
        url: 'https://trapstarofficial.store',
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Shop',
        url: 'https://trapstarofficial.store/store',
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Tracksuits',
        url: 'https://trapstarofficial.store/tracksuits',
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Jackets',
        url: 'https://trapstarofficial.store/jackets',
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Shorts',
        url: 'https://trapstarofficial.store/shorts',
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'T-Shirts',
        url: 'https://trapstarofficial.store/t-shirts',
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Bags',
        url: 'https://trapstarofficial.store/bags',
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Hoodies',
        url: 'https://trapstarofficial.store/hoodies',
      },
    ],
  }

  return (
    <Script
      id="site-navigation-schema"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(siteNavigationSchema),
      }}
    />
  )
}

