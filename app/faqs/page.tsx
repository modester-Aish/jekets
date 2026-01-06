import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQs | Trapstar Official | trapstarofficial.store',
  description: 'Frequently asked questions about Trapstar products, orders, shipping, returns, and more. Find answers to common questions.',
  keywords: 'Trapstar FAQ, frequently asked questions, help, support, trapstarofficial.store',
  openGraph: {
    title: 'FAQs | Trapstar Official',
    description: 'Find answers to frequently asked questions about Trapstar products and services.',
    url: 'https://trapstarofficial.store/faqs',
    siteName: 'Trapstar Official',
    type: 'website',
  },
  alternates: {
    canonical: 'https://trapstarofficial.store/faqs',
  },
}

export default function FAQs() {
  const faqs = [
    {
      category: 'Orders & Payment',
      questions: [
        {
          q: 'How do I place an order?',
          a: 'Simply browse our collection, select your desired items, choose your size, and proceed to checkout. You can pay securely using various payment methods including credit/debit cards, PayPal, or bank transfer.'
        },
        {
          q: 'What payment methods do you accept?',
          a: 'We accept all major credit and debit cards (Visa, Mastercard, American Express), PayPal, and direct bank transfers. All payments are processed securely through our payment gateway.'
        },
        {
          q: 'When will I be charged?',
          a: 'Your payment will be processed immediately when you place your order. For bank transfers, your order will be processed once payment is confirmed.'
        },
        {
          q: 'Can I modify or cancel my order?',
          a: 'Orders can be modified or cancelled within 24 hours of placement, provided they haven\'t been shipped. Please contact our customer care team immediately if you need to make changes.'
        }
      ]
    },
    {
      category: 'Shipping & Delivery',
      questions: [
        {
          q: 'How long does shipping take?',
          a: 'Standard shipping typically takes 5-10 business days for domestic orders and 10-20 business days for international orders. Express shipping options are available at checkout for faster delivery.'
        },
        {
          q: 'Do you ship internationally?',
          a: 'Yes, we ship worldwide. Shipping costs and delivery times vary by location. You can see shipping options and costs during checkout.'
        },
        {
          q: 'How much does shipping cost?',
          a: 'Shipping costs vary depending on your location and the shipping method selected. Standard shipping is free on orders over a certain amount. Exact costs will be calculated at checkout.'
        },
        {
          q: 'Can I track my order?',
          a: 'Yes, once your order ships, you will receive a tracking number via email. You can use this to track your package\'s journey to your doorstep.'
        },
        {
          q: 'What if my package is lost or damaged?',
          a: 'If your package is lost or arrives damaged, please contact our customer care team immediately. We will investigate and provide a replacement or full refund as appropriate.'
        }
      ]
    },
    {
      category: 'Returns & Exchanges',
      questions: [
        {
          q: 'What is your return policy?',
          a: 'Items can be returned within 30 days of delivery, provided they are in original condition with tags attached and unworn. Items must be in their original packaging.'
        },
        {
          q: 'How do I return an item?',
          a: 'Contact our customer care team to initiate a return. You will receive a return authorization and instructions. Once we receive and inspect your return, we will process your refund.'
        },
        {
          q: 'Are returns free?',
          a: 'Return shipping costs are the responsibility of the customer unless the item is defective or incorrect. We provide a prepaid return label for defective or incorrect items.'
        },
        {
          q: 'Can I exchange an item for a different size?',
          a: 'Yes, exchanges are available for different sizes, subject to availability. Please contact customer care to initiate an exchange. You may need to return the original item first.'
        },
        {
          q: 'How long does it take to process a refund?',
          a: 'Once we receive your return, refunds are typically processed within 5-7 business days. The refund will appear in your original payment method within 7-14 business days depending on your bank or payment provider.'
        }
      ]
    },
    {
      category: 'Products & Sizing',
      questions: [
        {
          q: 'How do I know what size to order?',
          a: 'Please refer to our comprehensive Size Guides page for detailed measurements. We recommend measuring yourself and comparing to our size charts for the best fit.'
        },
        {
          q: 'Are your products authentic?',
          a: 'Yes, all products sold on trapstarofficial.store are 100% authentic Trapstar products. We use Certilogo authentication technology to verify authenticity. Check our Authenticity Service page for more information.'
        },
        {
          q: 'Do you restock sold-out items?',
          a: 'We regularly restock popular items, but availability cannot be guaranteed. Sign up for our newsletter or follow us on social media to be notified when items are back in stock.'
        },
        {
          q: 'What materials are used in Trapstar products?',
          a: 'Trapstar uses premium materials including high-quality cotton, polyester blends, and technical fabrics. Specific material information is available on each product page.'
        },
        {
          q: 'How do I care for my Trapstar items?',
          a: 'Care instructions are provided on the label of each garment. Generally, we recommend washing on a gentle cycle with cold water and air drying or tumble drying on low heat. Avoid bleach and ironing directly on prints.'
        }
      ]
    },
    {
      category: 'Account & Website',
      questions: [
        {
          q: 'Do I need an account to place an order?',
          a: 'No, you can checkout as a guest. However, creating an account allows you to track orders, save your shipping information, and access exclusive offers.'
        },
        {
          q: 'I forgot my password. How do I reset it?',
          a: 'Click on "Sign In" and then "Forgot Password". Enter your email address and you will receive instructions to reset your password.'
        },
        {
          q: 'How do I update my account information?',
          a: 'Sign in to your account and navigate to your profile settings where you can update your personal information, shipping addresses, and payment methods.'
        },
        {
          q: 'Do you have a mobile app?',
          a: 'Currently, we do not have a mobile app, but our website is fully optimized for mobile devices and provides an excellent shopping experience on smartphones and tablets.'
        }
      ]
    },
    {
      category: 'Other Questions',
      questions: [
        {
          q: 'How do I contact customer service?',
          a: 'You can contact our customer care team through the Contact Us page, via email, or through our live chat feature during business hours. We typically respond within 24-48 hours.'
        },
        {
          q: 'Do you offer gift cards?',
          a: 'Gift cards are currently not available, but we are working on introducing this feature in the future. Sign up for our newsletter to be notified when gift cards become available.'
        },
        {
          q: 'Can I visit a physical store?',
          a: 'Trapstar Official operates as an online store. We do not have physical retail locations, but you can shop our full collection online at trapstarofficial.store.'
        },
        {
          q: 'How do I report a counterfeit product or website?',
          a: 'If you encounter a counterfeit Trapstar product or suspicious website, please contact our customer care team immediately with details. We take counterfeiting seriously and will investigate all reports.'
        }
      ]
    }
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-white mb-8">Frequently Asked Questions</h1>
      <div className="prose prose-invert max-w-none">
        <div className="text-gray-400 space-y-8">
          <p className="text-lg">
            Find answers to the most common questions about Trapstar products, orders, shipping, returns, and more. If you can't find what you're looking for, please don't hesitate to contact our customer care team.
          </p>

          {faqs.map((section, sectionIndex) => (
            <div key={sectionIndex} className="border-b border-gray-800 pb-8 last:border-b-0">
              <h2 className="text-2xl font-semibold text-white mb-6">{section.category}</h2>
              <div className="space-y-6">
                {section.questions.map((faq, faqIndex) => (
                  <div key={faqIndex} className="bg-gray-900/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">{faq.q}</h3>
                    <p className="text-gray-300 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-6 mt-12">
            <p className="text-blue-200 font-semibold mb-2">Still have questions?</p>
            <p className="text-gray-300 mb-4">
              Our customer care team is here to help. If you couldn't find the answer you're looking for, please contact us and we'll be happy to assist you.
            </p>
            <a
              href="/customer-care"
              className="inline-block bg-white text-black px-6 py-3 font-semibold rounded-lg hover:bg-gray-200 transition-all duration-300"
            >
              Contact Customer Care
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

