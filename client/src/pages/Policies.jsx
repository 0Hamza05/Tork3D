import React from 'react';
import { motion } from 'framer-motion';
import { SectionWrapper, fadeIn } from '../components/layout/SectionWrapper';

export default function Policies() {
  return (
    <div className="pt-24 min-h-screen">
      <SectionWrapper>
        <motion.div variants={fadeIn} className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">Store Policies</h1>
            <p className="text-xl text-slate-600 dark:text-slate-300">Terms of service, returns, and refund information.</p>
          </div>

          <div className="glass-card p-8 md:p-12 space-y-12">
            {/* Terms & Conditions */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 pb-2 border-b border-slate-200 dark:border-slate-700">
                Terms & Conditions
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                By accessing this website and placing an order with Tork3D, you agree to the following terms and conditions:
              </p>
              <ul className="list-disc pl-5 space-y-3 text-slate-600 dark:text-slate-300">
                <li>Please review all product descriptions, specifications, dimensions, and details carefully before placing an order.</li>
                <li>Returns, refunds, replacements, and cancellations are governed strictly by our Return & Refund Policy.</li>
                <li><strong>An unboxing video is mandatory</strong> for any claim related to damaged products, missing items, wrong products, refunds, or replacements. The video must be recorded clearly from the beginning of opening the package without cuts or edits.</li>
                <li>Claims raised without a valid unboxing video will not be accepted.</li>
                <li>Customized, personalized, made-to-order, or commissioned products are non-cancellable, non-returnable, and non-refundable unless received damaged or defective.</li>
                <li>Slight variations in color, finish, texture, dimensions, or appearance may occur due to lighting conditions, screen settings, material properties, and the nature of the 3D printing process.</li>
                <li>Minor layer lines, support marks, dimensional tolerances, or surface imperfections inherent to the 3D printing process shall not be considered manufacturing defects.</li>
                <li>Orders once shipped cannot be cancelled.</li>
                <li>Delivery timelines are estimates only and may vary due to courier delays, operational issues, weather conditions, or unforeseen circumstances.</li>
                <li>Customers are responsible for providing accurate shipping and contact details. Orders returned due to incorrect or incomplete information may incur additional reshipping charges.</li>
                <li>We reserve the right to cancel, refuse, or limit any order at our sole discretion.</li>
                <li>Our liability is limited strictly to the purchase value of the ordered product.</li>
                <li>We reserve the right to update or modify these terms and policies at any time without prior notice.</li>
              </ul>
            </section>

            {/* Return & Refund Policy */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 pb-2 border-b border-slate-200 dark:border-slate-700">
                Return & Refund Policy
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                At Tork3D, we strive to ensure that every order reaches you in excellent condition. Please read our return and refund policy carefully before placing an order.
              </p>
              <ul className="list-disc pl-5 space-y-3 text-slate-600 dark:text-slate-300">
                <li>Returns, replacements, or refunds are accepted only for products received in damaged, defective, or incorrect condition.</li>
                <li><strong>An unboxing video is mandatory</strong> for any return, refund, replacement, or missing item claim. The video must clearly show the sealed package being opened from the beginning without cuts or edits.</li>
                <li>Claims raised without an unboxing video will not be accepted.</li>
                <li>Any issue must be reported within 48 hours of delivery.</li>
                <li>To request a return, refund, or replacement, contact us at <a href="mailto:tork3d.design@gmail.com" className="text-accent-blue hover:underline">tork3d.design@gmail.com</a> with:
                  <ul className="list-circle pl-5 mt-2 space-y-1">
                    <li>Order ID</li>
                    <li>Description of the issue</li>
                    <li>Photos/videos of the product</li>
                    <li>Complete unboxing video proof</li>
                  </ul>
                </li>
                <li>Products must be unused, unaltered, and returned in their original packaging wherever applicable.</li>
                <li>Customized, personalized, or made-to-order products are non-returnable and non-refundable unless received damaged or defective.</li>
                <li>Refunds or returns will not be accepted for change of mind, incorrect selection, or subjective preferences after order confirmation.</li>
                <li>Minor surface marks, layer lines, support marks, dimensional tolerances, or slight finish variations resulting from the 3D printing process shall not be treated as defects.</li>
                <li>If approved, refunds will be processed to the original payment method within approximately 5–7 business days after inspection and approval.</li>
                <li>Shipping charges are non-refundable unless the error occurred from our side.</li>
                <li>We reserve the right to reject any claim that does not comply with the above conditions.</li>
              </ul>
            </section>
          </div>
        </motion.div>
      </SectionWrapper>
    </div>
  );
}
