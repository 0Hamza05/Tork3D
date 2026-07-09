// Razorpay's checkout.js (~58KB) used to load as a blocking <script> in
// index.html on every single page — even Home, Gallery, Contact — even
// though window.Razorpay is only ever used at the moment of payment (Cart.jsx).
// This loads it on demand instead, the first time it's actually needed, and
// caches the in-flight promise so concurrent/repeat calls reuse one fetch.
let razorpayPromise = null;

export function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve();
  if (razorpayPromise) return razorpayPromise;

  razorpayPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => {
      razorpayPromise = null; // allow retry on next attempt
      reject(new Error('Could not load the payment gateway. Please check your connection and try again.'));
    };
    document.body.appendChild(script);
  });
  return razorpayPromise;
}
