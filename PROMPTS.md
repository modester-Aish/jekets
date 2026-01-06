# Project Documentation - Prompts

## Prompt 1: Country/Currency Dropdown Implementation

### Overview
Yeh project mein ek country/currency selector dropdown implement kiya gaya hai jo header mein display hota hai. Jab user country select karta hai, to automatically currency change ho jati hai aur saare product prices us currency mein display hote hain.

### Implementation Details

#### 1. Currency Selector Component (`components/CurrencySelector.tsx`)
- **Location**: `components/CurrencySelector.tsx`
- **Type**: Client-side component (`'use client'`)
- **Functionality**:
  - Dropdown menu jo countries list karta hai
  - Har country ke saath uska currency symbol show hota hai
  - User country select karne par:
    - Country code localStorage mein save hota hai
    - Custom event `currencyChanged` dispatch hota hai
    - Event mein `currency`, `countryCode`, aur `symbol` pass hota hai

#### 2. Currency Library (`lib/currency.ts`)
- **Location**: `lib/currency.ts`
- **Contents**:
  - `EXCHANGE_RATES`: Object jo har currency ka USD se exchange rate store karta hai
  - `COUNTRIES`: Array jo countries, unke codes, currencies, aur symbols store karta hai
  - `convertPrice()`: Function jo price ko ek currency se doosri currency mein convert karta hai
  - `formatPrice()`: Function jo price ko proper format mein display karta hai (symbol + amount)
  - `getCurrencyInfo()`: Function jo country code se currency info return karta hai

#### 3. Price Display Component (`components/PriceDisplay.tsx`)
- **Location**: `components/PriceDisplay.tsx`
- **Type**: Client-side component
- **Functionality**:
  - Product prices ko display karta hai
  - Currency conversion automatically apply hota hai
  - `currencyChanged` event listen karta hai
  - Jab currency change hoti hai, prices automatically update ho jate hain
  - Discount prices bhi properly handle karta hai (original price strikethrough ke saath)

#### 4. Integration Points
- **Navbar** (`components/Navbar.tsx`):
  - CurrencySelector component header mein add kiya gaya hai
  - Right side icons ke saath display hota hai

- **Product Pages**:
  - Homepage (`app/page.tsx`): PriceDisplay component use karta hai
  - Store Page (`app/store/page.tsx`): PriceDisplay component use karta hai
  - Category Pages (`app/[category]/page.tsx`): PriceDisplay component use karta hai
  - Checkout Page (`app/checkout/page.tsx`): PriceDisplay component use karta hai

#### 5. How It Works
1. User page load karta hai → CurrencySelector localStorage se saved country load karta hai (default: US)
2. User dropdown click karta hai → Countries list show hoti hai
3. User country select karta hai → 
   - Country code localStorage mein save hota hai
   - `currencyChanged` event dispatch hota hai
4. Saare PriceDisplay components event catch karte hain →
   - Currency update hoti hai
   - Prices convert ho jate hain
   - UI automatically update ho jata hai

#### 6. Currency Conversion Logic
- Base currency: USD (WooCommerce se prices USD mein aate hain)
- Conversion formula: 
  ```
  Price in USD / USD rate = Base amount
  Base amount × Target currency rate = Converted price
  ```
- Example: $100 USD → PKR
  - $100 / 1.0 = 100
  - 100 × 278 = ₨27,800

#### 7. Supported Countries & Currencies
- United States (USD - $)
- United Kingdom (GBP - £)
- Pakistan (PKR - ₨)
- India (INR - ₹)
- Canada (CAD - CA$)
- Australia (AUD - A$)
- Germany, France, Italy, Spain (EUR - €)
- UAE (AED - د.إ)
- Saudi Arabia (SAR - ر.س)
- Japan (JPY - ¥)
- China (CNY - ¥)

---

## Prompt 2: Checkout Page Implementation & Integration

### Overview
Yeh project mein ek complete checkout page implement kiya gaya hai jo WooCommerce se product data fetch karta hai, payment methods handle karta hai, aur order processing ke liye ready hai.

### Implementation Details

#### 1. Checkout Page Component (`app/checkout/page.tsx`)
- **Location**: `app/checkout/page.tsx`
- **Type**: Client-side component with Suspense wrapper
- **Main Features**:
  - Product fetching by slug
  - Payment methods integration
  - Currency conversion support
  - Form handling (name, email, phone, address)
  - Order summary display

#### 2. Product Fetching Integration

##### API Route: `/api/products/[slug]/route.ts`
- **Location**: `app/api/products/[slug]/route.ts`
- **Functionality**:
  - Single product ko slug se fetch karta hai
  - Internally `getAllProducts()` use karta hai jo cache se data fetch karta hai
  - Response format:
    ```json
    {
      "id": "product-id",
      "name": "Product Name",
      "slug": "product-slug",
      "price": 100,
      "discountPrice": 80,
      "images": [...],
      "category": "category-name",
      ...
    }
    ```

##### Checkout Page Product Fetching:
```typescript
async function fetchProduct() {
  const response = await fetch(`/api/products/${productSlug}`)
  const foundProduct = await response.json()
  setProduct(foundProduct)
}
```

#### 3. Payment Methods Integration

##### API Route: `/api/payment-methods/route.ts`
- **Location**: `app/api/payment-methods/route.ts`
- **Functionality**:
  - WooCommerce REST API se payment methods fetch karta hai
  - Available payment gateways return karta hai
  - Response format:
    ```json
    {
      "paymentMethods": [
        {
          "id": "bacs",
          "title": "Direct Bank Transfer",
          "description": "..."
        },
        ...
      ]
    }
    ```

##### Checkout Page Payment Methods:
```typescript
async function fetchPaymentMethods() {
  const response = await fetch('/api/payment-methods')
  const data = await response.json()
  setPaymentMethods(data.paymentMethods || [])
}
```

#### 4. Currency Integration

##### PriceDisplay Component Integration:
- Checkout page mein PriceDisplay component use hota hai
- Currency conversion automatically apply hoti hai
- Real-time currency updates support karta hai

##### Implementation:
```typescript
// State for currency
const [currency, setCurrency] = useState('$')
const [countryCode, setCountryCode] = useState('US')

// Listen for currency changes
useEffect(() => {
  const handleCurrencyChange = (e: CustomEvent) => {
    setCurrency(e.detail.currency)
    setCountryCode(e.detail.countryCode)
  }
  window.addEventListener('currencyChanged', handleCurrencyChange)
  return () => window.removeEventListener('currencyChanged', handleCurrencyChange)
}, [])
```

#### 5. Form Handling

##### Form Fields:
- **Customer Name**: Text input
- **Email**: Email input with validation
- **Phone**: Phone input
- **Address**: Textarea
- **Payment Method**: Radio buttons (dynamically loaded from API)
- **Quantity**: Number input (1-10 range)

##### Form Submission:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  // Form validation
  // Order data preparation
  // API call to create order
}
```

#### 6. Order Processing Flow

##### Step 1: Product Selection
- User product page se checkout par aata hai
- URL parameter se product slug extract hota hai: `?product=product-slug`
- Product data fetch hota hai

##### Step 2: Form Filling
- User apna information fill karta hai
- Payment method select karta hai
- Quantity select karta hai

##### Step 3: Order Creation
- Form submit par order data prepare hota hai
- WooCommerce API ko order create karne ke liye call hota hai
- Order confirmation show hota hai

#### 7. WooCommerce Integration

##### API Configuration:
- **Base URL**: Environment variable se
- **Authentication**: Consumer Key & Consumer Secret
- **Endpoints Used**:
  - `/wp-json/wc/v3/products` - Products fetch
  - `/wp-json/wc/v3/payment_gateways` - Payment methods
  - `/wp-json/wc/v3/orders` - Order creation

##### Order Creation Payload:
```typescript
{
  payment_method: selectedPaymentMethod,
  payment_method_title: paymentMethodTitle,
  set_paid: false,
  billing: {
    first_name: name,
    email: email,
    phone: phone,
    address_1: address,
  },
  line_items: [
    {
      product_id: product.id,
      quantity: quantity,
    }
  ],
  currency: currency,
}
```

#### 8. Error Handling

##### Product Not Found:
- Agar product slug invalid hai
- "Product Not Found" message show hota hai
- Back to store button provide karta hai

##### API Errors:
- Network errors handle kiye gaye hain
- Fallback messages show hote hain
- User-friendly error messages

#### 9. UI/UX Features

##### Loading States:
- Product loading: Skeleton loader
- Payment methods loading: Loading indicator
- Form submission: Submit button disabled state

##### Responsive Design:
- Mobile-friendly layout
- Touch-friendly inputs
- Responsive grid system

##### Visual Elements:
- Product image display
- Price with currency conversion
- Discount price highlighting
- Order summary card

#### 10. Caching Integration

##### Product Cache:
- Checkout page `/api/products/[slug]` use karta hai
- Yeh route internally `getAllProducts()` use karta hai
- Cache se data fetch hota hai (1 hour TTL)
- Webhook se cache invalidate hota hai

##### Benefits:
- Fast product loading
- Reduced API calls
- Better performance

#### 11. Complete Integration Flow

```
User clicks "Buy Now" on product page
    ↓
Redirects to /checkout?product=product-slug
    ↓
Checkout page loads
    ↓
Fetch product from /api/products/[slug] (uses cache)
    ↓
Fetch payment methods from /api/payment-methods
    ↓
Display product info with currency conversion
    ↓
User fills form and selects payment method
    ↓
Form submission
    ↓
Create order via WooCommerce API
    ↓
Show order confirmation
```

#### 12. Key Files & Their Roles

- **`app/checkout/page.tsx`**: Main checkout page component
- **`app/api/products/[slug]/route.ts`**: Single product API endpoint
- **`app/api/payment-methods/route.ts`**: Payment methods API endpoint
- **`components/PriceDisplay.tsx`**: Currency-aware price display
- **`lib/products.ts`**: Product fetching logic with caching
- **`lib/cache.ts`**: Persistent cache management
- **`lib/currency.ts`**: Currency conversion utilities

#### 13. Environment Variables Required

```env
WOOCOMMERCE_URL=https://your-store.com
WOOCOMMERCE_CONSUMER_KEY=your_consumer_key
WOOCOMMERCE_CONSUMER_SECRET=your_consumer_secret
```

#### 14. Testing Checklist

- [ ] Product loads correctly from slug
- [ ] Payment methods display properly
- [ ] Currency conversion works
- [ ] Form validation works
- [ ] Order creation successful
- [ ] Error handling works
- [ ] Mobile responsive
- [ ] Loading states work
- [ ] Cache invalidation works

---

## Summary

### Country/Currency Dropdown:
- **Component**: CurrencySelector
- **Integration**: Navbar header
- **Functionality**: Real-time currency conversion across all pages
- **Storage**: localStorage for persistence
- **Event System**: Custom events for reactivity

### Checkout Page:
- **Product Fetching**: Cached API route
- **Payment Integration**: WooCommerce payment gateways
- **Currency Support**: Full currency conversion
- **Order Processing**: Complete WooCommerce integration
- **User Experience**: Responsive, error-handled, loading states

Both features are fully integrated and working together to provide a seamless shopping experience with multi-currency support and complete checkout functionality.

