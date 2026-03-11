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

  // Rating container with aria-label e.g. "Rating: 4.5 out of 5 stars"
  RATING_CONTAINER: '.item-rating',

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
} as const;
