export const NEWEGG_SELECTORS = {
  // Product grid
  PRODUCT_CELL: '.item-cells-wrap .item-cell',

  // Within each product cell
  TITLE: '.item-title',
  IMAGE: '.item-img img',

  // Price: dollars in <strong>, cents in <sup>
  PRICE_DOLLARS: '.price-current strong',
  PRICE_CENTS: '.price-current sup',

  // Was/original/strikethrough price
  PRICE_WAS: '.price-was-data',

  // Rating icon — class is e.g. "rating-4" or "rating-5"; aria-label holds "Rating: X out of 5 stars"
  RATING_CONTAINER: 'i[class*="rating-"]',

  // Review count e.g. "(1,234)"
  REVIEW_COUNT: '.item-rating-num',

  // Shipping text e.g. "Free Shipping" or "$X.XX Shipping"
  SHIPPING: '.price-ship',

  // Pagination: "Page 1/10"
  PAGINATION: '.list-tool-pagination-text',

  // Sponsored / promoted label
  SPONSORED_LABEL: '.item-promo',

  // Promotional tags e.g. "Newegg Select", "AI Ready", etc.
  TAG: 'div.tag-text',

  // ── Product detail page ──────────────────────────────────────────────────

  // Title
  DETAIL_TITLE: 'h1.product-title',

  // Brand link inside the title area
  DETAIL_BRAND: 'div.product-view-brand a',

  // Main (zoomed) product image
  DETAIL_MAIN_IMAGE: '.product-view-img-original',

  // Thumbnail images in the gallery strip
  DETAIL_GALLERY_THUMBS: 'img.product-view-img-biggest',

  // Price: same structure as listing — reuse PRICE_DOLLARS / PRICE_CENTS / PRICE_WAS

  // Rating icon — class is e.g. "rating-4" or "rating-5"; title holds "X out of 5 eggs"
  DETAIL_RATING: 'i[class*="rating-"]',

  // Review count e.g. "(1,234)"
  DETAIL_REVIEW_COUNT: '.item-rating-num',

  // Stock / availability text
  DETAIL_AVAILABILITY: '.product-inventory strong',

  // Shipping line inside the purchase panel
  DETAIL_SHIPPING: '.product-delivery-title > span',

  // Bullet-point feature list
  DETAIL_BULLETS: '.product-bullets li',

  // Specs table rows
  DETAIL_SPEC_ROW: '.table-horizontal tr',
  DETAIL_SPEC_KEY: 'th',
  DETAIL_SPEC_VALUE: 'td',
} as const;
