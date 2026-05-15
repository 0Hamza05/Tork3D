-- Run this in Supabase SQL Editor
-- Then find "tork3d_orders_simple" in your Table Editor sidebar

DROP VIEW IF EXISTS tork3d_orders_simple;

CREATE VIEW tork3d_orders_simple AS
SELECT
  -- When they ordered
  TO_CHAR(created_at, 'DD Mon YYYY')             AS "Date",

  -- Who they are
  customer_name                                   AS "Customer",
  customer_email                                  AS "Email",
  COALESCE(
    order_details->>'phone',
    order_details->>'customerPhone'
  )                                               AS "Phone",

  -- What they ordered
  order_type                                      AS "Order Type",
  CASE
    WHEN order_type = 'Quote Request' THEN
      CONCAT(
        order_details->>'quantity', 'x ',
        order_details->>'material', ' / ',
        order_details->>'color'
      )
    WHEN order_type = 'cart' THEN
      (
        SELECT STRING_AGG(
          CONCAT(item->>'quantity', 'x ', item->>'name'),
          ', '
        )
        FROM jsonb_array_elements(order_details->'items') AS item
      )
    ELSE order_details->>'productName'
  END                                             AS "Items",

  -- Delivery address (for cart/shop orders)
  CASE
    WHEN order_details->'shippingAddress' IS NOT NULL THEN
      CONCAT(
        order_details->'shippingAddress'->>'address1',
        CASE WHEN order_details->'shippingAddress'->>'address2' != ''
          THEN CONCAT(', ', order_details->'shippingAddress'->>'address2')
          ELSE '' END,
        ', ', order_details->'shippingAddress'->>'city',
        ' - ', order_details->'shippingAddress'->>'pincode',
        ', ', order_details->'shippingAddress'->>'state'
      )
    ELSE '—'
  END                                             AS "Delivery Address",

  -- Delivery type & cost (cart orders)
  CASE
    WHEN order_details->>'shippingMode' = 'express' THEN 'Express (1–3 days)'
    WHEN order_details->>'shippingMode' = 'surface' THEN 'Standard (4–7 days)'
    WHEN order_details->>'shippingMode' = 'pickup' THEN 'Collect from Site'
    ELSE '—'
  END                                             AS "Delivery Type",
  COALESCE((order_details->>'shippingCost')::numeric, 0) AS "Shipping Cost (₹)",

  -- Payment method
  CASE
    WHEN order_details->>'paymentType' = 'COD' THEN 'Cash on Delivery'
    WHEN status = 'cod_pending'                THEN 'Cash on Delivery'
    ELSE 'Online (Razorpay)'
  END                                             AS "Payment Method",

  -- Payment
  COALESCE(total_amount, 0)                       AS "Amount (₹)",
  INITCAP(REPLACE(status, '_', ' '))             AS "Status"

FROM tork3d_orders
ORDER BY created_at DESC;
