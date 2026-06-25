export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Set to true to temporarily close the shop (Shop, Product, Cart, Custom Order
// pages show a maintenance message instead). Flip back to false to reopen.
export const MAINTENANCE_MODE = false;

// Set to true to lock the ENTIRE site behind a "Coming Soon" countdown page.
// Every route renders the countdown except /early-access (the coupon signup).
// Flip back to false on launch day to reopen the full site.
export const LAUNCH_LOCK = false;

// The launch date/time the countdown ticks down to. 30th June 2026, 12:00 AM IST.
export const LAUNCH_DATE = '2026-06-30T00:00:00+05:30';
