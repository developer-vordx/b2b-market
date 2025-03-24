import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, TrendingUp, Shield } from 'lucide-react';

export function Home() {
  return (
    <div className="space-y-16">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          Your Trusted B2B Marketplace
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Connect with verified vendors, streamline your procurement process, and grow your business with our secure B2B platform.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/register"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium"
          >
            Get Started
          </Link>
          <Link
            to="/products"
            className="bg-white text-blue-600 px-6 py-3 rounded-md border border-blue-600 hover:bg-blue-50 font-medium"
          >
            Browse Products
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="flex justify-center mb-4">
            <ShoppingBag className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Wide Product Selection</h3>
          <p className="text-gray-600">
            Access thousands of products from verified vendors across multiple categories.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="flex justify-center mb-4">
            <TrendingUp className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Streamlined Procurement</h3>
          <p className="text-gray-600">
            Efficient ordering process with integrated payment and tracking systems.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Secure Transactions</h3>
          <p className="text-gray-600">
            Protected payments and verified vendor profiles for safe trading.
          </p>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">For Buyers</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-1">1</span>
                <p>Create a buyer account and verify your business</p>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-1">2</span>
                <p>Browse products and connect with vendors</p>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-1">3</span>
                <p>Place orders and manage your procurement</p>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">For Vendors</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-1">1</span>
                <p>Register as a vendor and complete verification</p>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-1">2</span>
                <p>List your products and set pricing</p>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-1">3</span>
                <p>Manage orders and receive payments</p>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}