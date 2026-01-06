import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Size Guides | Trapstar Official | trapstarofficial.store',
  description: 'Find the perfect fit with Trapstar size guides for tracksuits, jackets, t-shirts, hoodies, and more. International sizing charts available.',
  keywords: 'Trapstar size guide, sizing chart, size guide, fit guide, trapstarofficial.store',
  openGraph: {
    title: 'Size Guides | Trapstar Official',
    description: 'Find the perfect fit with Trapstar size guides for all products.',
    url: 'https://trapstarofficial.store/size-guides',
    siteName: 'Trapstar Official',
    type: 'website',
  },
  alternates: {
    canonical: 'https://trapstarofficial.store/size-guides',
  },
}

export default function SizeGuides() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-white mb-8">Size Guides</h1>
      <div className="prose prose-invert max-w-none">
        <div className="text-gray-400 space-y-6">
          <p className="text-lg">
            Finding the perfect fit is essential for your Trapstar experience. Use our comprehensive size guides below to ensure you select the right size for your style.
          </p>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 my-8">
            <h2 className="text-2xl font-semibold text-white mb-4">How to Measure</h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-300">
              <li><strong>Chest:</strong> Measure around the fullest part of your chest, keeping the tape measure horizontal</li>
              <li><strong>Waist:</strong> Measure around your natural waistline, usually just above your belly button</li>
              <li><strong>Hips:</strong> Measure around the fullest part of your hips</li>
              <li><strong>Length:</strong> For tops, measure from the top of the shoulder down to the desired length</li>
              <li><strong>Inseam:</strong> For bottoms, measure from the crotch down to the desired length</li>
            </ol>
            <p className="text-yellow-300 mt-4 text-sm">
              💡 Tip: Always measure while wearing the undergarments you plan to wear with the item.
            </p>
          </div>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">T-Shirts & Hoodies</h2>
          
          <div className="overflow-x-auto my-6">
            <table className="w-full border-collapse border border-gray-700">
              <thead>
                <tr className="bg-gray-900">
                  <th className="border border-gray-700 px-4 py-3 text-left text-white font-semibold">Size</th>
                  <th className="border border-gray-700 px-4 py-3 text-left text-white font-semibold">Chest (cm)</th>
                  <th className="border border-gray-700 px-4 py-3 text-left text-white font-semibold">Length (cm)</th>
                  <th className="border border-gray-700 px-4 py-3 text-left text-white font-semibold">US Size</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr>
                  <td className="border border-gray-700 px-4 py-3 font-medium">S</td>
                  <td className="border border-gray-700 px-4 py-3">96-100</td>
                  <td className="border border-gray-700 px-4 py-3">70</td>
                  <td className="border border-gray-700 px-4 py-3">Small</td>
                </tr>
                <tr className="bg-gray-900/50">
                  <td className="border border-gray-700 px-4 py-3 font-medium">M</td>
                  <td className="border border-gray-700 px-4 py-3">100-104</td>
                  <td className="border border-gray-700 px-4 py-3">72</td>
                  <td className="border border-gray-700 px-4 py-3">Medium</td>
                </tr>
                <tr>
                  <td className="border border-gray-700 px-4 py-3 font-medium">L</td>
                  <td className="border border-gray-700 px-4 py-3">104-108</td>
                  <td className="border border-gray-700 px-4 py-3">74</td>
                  <td className="border border-gray-700 px-4 py-3">Large</td>
                </tr>
                <tr className="bg-gray-900/50">
                  <td className="border border-gray-700 px-4 py-3 font-medium">XL</td>
                  <td className="border border-gray-700 px-4 py-3">108-112</td>
                  <td className="border border-gray-700 px-4 py-3">76</td>
                  <td className="border border-gray-700 px-4 py-3">X-Large</td>
                </tr>
                <tr>
                  <td className="border border-gray-700 px-4 py-3 font-medium">XXL</td>
                  <td className="border border-gray-700 px-4 py-3">112-116</td>
                  <td className="border border-gray-700 px-4 py-3">78</td>
                  <td className="border border-gray-700 px-4 py-3">2X-Large</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Tracksuits & Bottoms</h2>
          
          <div className="overflow-x-auto my-6">
            <table className="w-full border-collapse border border-gray-700">
              <thead>
                <tr className="bg-gray-900">
                  <th className="border border-gray-700 px-4 py-3 text-left text-white font-semibold">Size</th>
                  <th className="border border-gray-700 px-4 py-3 text-left text-white font-semibold">Waist (cm)</th>
                  <th className="border border-gray-700 px-4 py-3 text-left text-white font-semibold">Hips (cm)</th>
                  <th className="border border-gray-700 px-4 py-3 text-left text-white font-semibold">Inseam (cm)</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr>
                  <td className="border border-gray-700 px-4 py-3 font-medium">S</td>
                  <td className="border border-gray-700 px-4 py-3">76-80</td>
                  <td className="border border-gray-700 px-4 py-3">88-92</td>
                  <td className="border border-gray-700 px-4 py-3">76</td>
                </tr>
                <tr className="bg-gray-900/50">
                  <td className="border border-gray-700 px-4 py-3 font-medium">M</td>
                  <td className="border border-gray-700 px-4 py-3">80-84</td>
                  <td className="border border-gray-700 px-4 py-3">92-96</td>
                  <td className="border border-gray-700 px-4 py-3">78</td>
                </tr>
                <tr>
                  <td className="border border-gray-700 px-4 py-3 font-medium">L</td>
                  <td className="border border-gray-700 px-4 py-3">84-88</td>
                  <td className="border border-gray-700 px-4 py-3">96-100</td>
                  <td className="border border-gray-700 px-4 py-3">80</td>
                </tr>
                <tr className="bg-gray-900/50">
                  <td className="border border-gray-700 px-4 py-3 font-medium">XL</td>
                  <td className="border border-gray-700 px-4 py-3">88-92</td>
                  <td className="border border-gray-700 px-4 py-3">100-104</td>
                  <td className="border border-gray-700 px-4 py-3">82</td>
                </tr>
                <tr>
                  <td className="border border-gray-700 px-4 py-3 font-medium">XXL</td>
                  <td className="border border-gray-700 px-4 py-3">92-96</td>
                  <td className="border border-gray-700 px-4 py-3">104-108</td>
                  <td className="border border-gray-700 px-4 py-3">84</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Jackets & Outerwear</h2>
          
          <div className="overflow-x-auto my-6">
            <table className="w-full border-collapse border border-gray-700">
              <thead>
                <tr className="bg-gray-900">
                  <th className="border border-gray-700 px-4 py-3 text-left text-white font-semibold">Size</th>
                  <th className="border border-gray-700 px-4 py-3 text-left text-white font-semibold">Chest (cm)</th>
                  <th className="border border-gray-700 px-4 py-3 text-left text-white font-semibold">Shoulder (cm)</th>
                  <th className="border border-gray-700 px-4 py-3 text-left text-white font-semibold">Sleeve (cm)</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr>
                  <td className="border border-gray-700 px-4 py-3 font-medium">S</td>
                  <td className="border border-gray-700 px-4 py-3">98-102</td>
                  <td className="border border-gray-700 px-4 py-3">44</td>
                  <td className="border border-gray-700 px-4 py-3">62</td>
                </tr>
                <tr className="bg-gray-900/50">
                  <td className="border border-gray-700 px-4 py-3 font-medium">M</td>
                  <td className="border border-gray-700 px-4 py-3">102-106</td>
                  <td className="border border-gray-700 px-4 py-3">46</td>
                  <td className="border border-gray-700 px-4 py-3">64</td>
                </tr>
                <tr>
                  <td className="border border-gray-700 px-4 py-3 font-medium">L</td>
                  <td className="border border-gray-700 px-4 py-3">106-110</td>
                  <td className="border border-gray-700 px-4 py-3">48</td>
                  <td className="border border-gray-700 px-4 py-3">66</td>
                </tr>
                <tr className="bg-gray-900/50">
                  <td className="border border-gray-700 px-4 py-3 font-medium">XL</td>
                  <td className="border border-gray-700 px-4 py-3">110-114</td>
                  <td className="border border-gray-700 px-4 py-3">50</td>
                  <td className="border border-gray-700 px-4 py-3">68</td>
                </tr>
                <tr>
                  <td className="border border-gray-700 px-4 py-3 font-medium">XXL</td>
                  <td className="border border-gray-700 px-4 py-3">114-118</td>
                  <td className="border border-gray-700 px-4 py-3">52</td>
                  <td className="border border-gray-700 px-4 py-3">70</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-6 my-8">
            <p className="text-blue-200 font-semibold mb-2">ℹ️ Size Guide Tips</p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>All measurements are in centimeters (cm)</li>
              <li>Sizes may vary slightly between different product styles</li>
              <li>If you're between sizes, we recommend sizing up for a more comfortable fit</li>
              <li>For a relaxed fit, choose one size larger than your measurements</li>
              <li>For a fitted look, choose your exact size based on measurements</li>
            </ul>
          </div>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">International Size Conversion</h2>
          
          <p>
            Our products are sized according to UK standards. If you're unsure about your size, refer to the measurement tables above or contact our customer care team for personalized sizing assistance.
          </p>

          <p className="mt-4">
            Need help finding your perfect size? Our customer care team is here to help. Contact us with your measurements and we'll recommend the best size for you.
          </p>
        </div>
      </div>
    </div>
  )
}

