# WooCommerce Real-Time Sync Setup

Yeh setup WooCommerce se real-time sync enable karta hai. Jab bhi WooCommerce mein products update hote hain, changes automatically yahan reflect hote hain.

## Features

1. **Real-Time Sync**: WooCommerce mein changes hote hi yahan reflect hote hain
2. **Webhook Support**: WooCommerce webhooks se automatic updates receive hote hain
3. **Dynamic Rendering**: Sab pages fresh data fetch karte hain (no caching)
4. **Automatic Revalidation**: Webhook aane par sab pages automatically revalidate hote hain

## WooCommerce Webhook Configuration

WooCommerce mein webhook setup karein:

1. **WooCommerce Admin** → **Settings** → **Advanced** → **Webhooks**
2. **Add webhook** click karein
3. Settings configure karein:
   - **Name**: Product Sync Webhook
   - **Status**: Active
   - **Topic**: Product created, Product updated, Product deleted (3 separate webhooks banayein ya ek webhook with "All" topic)
   - **Delivery URL**: `https://your-domain.com/api/woocommerce/webhook`
   - **Secret**: (Optional) Security ke liye secret key add karein
   - **API Version**: WP REST API Integration v3

4. **Save webhook** click karein

## How It Works

1. **WooCommerce mein product update/delete/create** → Webhook trigger hota hai
2. **Webhook endpoint** (`/api/woocommerce/webhook`) webhook receive karta hai
3. **Automatic revalidation** - Sab pages revalidate hote hain:
   - Homepage (`/`)
   - Store page (`/store`)
   - Category pages (`/tracksuits`, `/jackets`, etc.)
   - Product detail pages
   - Search page

4. **Next request par** fresh data WooCommerce se fetch hota hai

## Manual Testing

Webhook manually test karne ke liye:

```bash
curl -X POST https://your-domain.com/api/woocommerce/webhook \
  -H "Content-Type: application/json" \
  -d '{"action":"product.updated","resource":"product","id":123}'
```

## Current Configuration

- **API Route**: `/api/woocommerce/webhook`
- **Cache Duration**: 10 seconds (minimal caching)
- **Revalidation**: Automatic on webhook
- **Dynamic Rendering**: Enabled on all product pages

## Pages with Real-Time Sync

- ✅ Homepage (`/`)
- ✅ Store page (`/store`)
- ✅ Category pages (`/[category]`)
- ✅ Product detail pages (`/[category]` - product slug)
- ✅ Search page (`/search`)
- ✅ API route (`/api/products`)

## Notes

- Webhook endpoint publicly accessible hai (security ke liye secret key use karein)
- Agar WooCommerce unavailable ho, fallback data use hota hai
- Timeout: 20 seconds server-side, 10 seconds client-side
- Sab pages `force-dynamic` mode mein hain - no static caching

