import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Store, UserCircle, ShoppingCart, LogOut } from 'lucide-react';

export function Navigation() {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Store className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-800">B2B Marketplace</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/products" className="text-gray-600 hover:text-gray-900">Products</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
                  <UserCircle className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}