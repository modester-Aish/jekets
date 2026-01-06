import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authenticity Service | Trapstar Official | trapstarofficial.store',
  description: 'Verify the authenticity of your Trapstar products using our Certilogo authentication service. Check your product with the 12-digit code or QR code.',
  keywords: 'Trapstar authenticity, verify Trapstar, Certilogo, authentic Trapstar, trapstarofficial.store',
  openGraph: {
    title: 'Authenticity Service | Trapstar Official',
    description: 'Verify the authenticity of your Trapstar products using our Certilogo authentication service.',
    url: 'https://trapstarofficial.store/authenticity-service',
    siteName: 'Trapstar Official',
    type: 'website',
  },
  alternates: {
    canonical: 'https://trapstarofficial.store/authenticity-service',
  },
}

export default function AuthenticityService() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-white mb-8">Authenticity Service</h1>
      <div className="prose prose-invert max-w-none">
        <div className="text-gray-400 space-y-6">
          <p className="text-lg">
            Trapstar has activated a garment authentication service. Since the Autumn Winter 2022 collection, Trapstar has used Certilogo® technology and experience to offer customers the possibility of verifying the authenticity of their Trapstar products.
          </p>
          
          <p>
            Garments can be authenticated, either by using the 12-digit Certilogo code or by using a mobile phone to scan the QR code. The code and QR code are on the security label inside the garments.
          </p>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 my-8">
            <p className="text-white font-semibold mb-4">How to Verify Your Product:</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-300">
              <li>Locate the security label inside your Trapstar garment</li>
              <li>Find the 12-digit Certilogo code or QR code on the label</li>
              <li>Click the button below to access the authentication service</li>
              <li>Enter your code or scan the QR code to verify authenticity</li>
            </ol>
          </div>

          <div className="text-center my-8">
            <a
              href="https://www.certilogo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-black px-8 py-4 font-bold text-lg rounded-lg hover:bg-gray-200 transition-all duration-300"
            >
              CHECK HERE
            </a>
            <p className="text-sm text-gray-500 mt-4">
              By clicking "CHECK HERE" above, you'll be redirected to the Trapstar London authentication service on the Certilogo® website.
            </p>
          </div>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Fighting against fake products</h2>
          
          <p>
            Trapstar is aware of the existence of websites selling counterfeit products. Some even reproduce the brand's trademark and are therefore particularly misleading for consumers. These sites are often registered with a domain comprising the brand name Trapstar, or something similar, and additional words such as 'jackets', 'outlet' or 'official'.
          </p>

          <p>
            It is our priority to defend and protect our customers and our brand. For this reason, we have activated every possible action against the online and offline sale of fake products and the shutdown of deceptive sites, listings, accounts and social media pages. To ensure effective and timely worldwide monitoring and enforcement activities, we rely on experienced anti-counterfeiting providers.
          </p>

          <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-6 my-8">
            <p className="text-yellow-200 font-semibold mb-2">⚠️ Important Notice</p>
            <p className="text-gray-300">
              Those who have ordered or purchased a fake garment can go to their local authority and contact their bank to, where possible, block payment made to a suspected fraudulent site. To inform us of a suspected counterfeit product or website, please contact customer services, including a link to the site or the name and location of the retailer.
            </p>
            <p className="text-white mt-4 font-medium">
              Our official website is <span className="text-yellow-300">trapstarofficial.store</span>
            </p>
          </div>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Why Authenticity Matters</h2>
          
          <p>
            Authentic Trapstar products are made with premium materials and craftsmanship. Counterfeit products not only deceive customers but also fail to meet our quality standards. By verifying your product's authenticity, you ensure you're getting the genuine Trapstar experience.
          </p>

          <p>
            If you have any questions about product authenticity or need assistance with verification, please don't hesitate to contact our customer care team.
          </p>
        </div>
      </div>
    </div>
  )
}

