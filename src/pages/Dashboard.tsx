import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Store, Package, ShoppingCart, AlertCircle, Plus, CreditCard } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  category: string;
}

interface Subscription {
  id: string;
  plan_type: string;
  status: string;
  current_period_end: string;
}

export function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchData();
  }, [user, profile]);

  async function fetchData() {
    try {
      setLoading(true);
      if (profile?.user_type === 'vendor') {
        // Fetch vendor's subscription
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('vendor_id', user?.id)
          .single();

        if (subscriptionError) throw subscriptionError;
        setSubscription(subscriptionData);

        // Fetch vendor's products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('vendor_id', user?.id)
          .order('created_at', { ascending: false });

        if (productsError) throw productsError;
        setProducts(productsData || []);

        // Fetch vendor's orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('vendor_id', user?.id)
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;
        setOrders(ordersData || []);
      } else {
        // Fetch buyer's orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('buyer_id', user?.id)
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;
        setOrders(ordersData || []);
      }
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-red-600 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {profile?.company_name}</h1>
        <p className="text-gray-600 mt-2">
          {profile?.user_type === 'vendor' ? 'Manage your products and orders' : 'View your orders and purchase history'}
        </p>
      </div>

      {profile?.user_type === 'vendor' && (
        <>
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Subscription Status</h2>
                  <p className="text-gray-600 mt-1">
                    {subscription ? (
                      <>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${subscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {subscription.status.toUpperCase()}
                        </span>
                        <span className="ml-2">
                          {subscription.plan_type.charAt(0).toUpperCase() + subscription.plan_type.slice(1)} Plan
                        </span>
                        <span className="ml-2 text-sm">
                          (Expires: {new Date(subscription.current_period_end).toLocaleDateString()})
                        </span>
                      </>
                    ) : (
                      'No active subscription'
                    )}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/subscription')}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>{subscription ? 'Manage Subscription' : 'Subscribe Now'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Your Products</h2>
              <button
                onClick={() => navigate('/products/new')}
                disabled={!subscription || subscription.status !== 'active'}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-5 w-5" />
                <span>Add Product</span>
              </button>
            </div>

            {!subscription || subscription.status !== 'active' ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                  <p className="ml-3 text-yellow-700">
                    You need an active subscription to list products. Please subscribe to start selling.
                  </p>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No products listed</h3>
                <p className="text-gray-500">Start selling by adding your first product</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              {product.category || 'Uncategorized'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${product.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.stock_quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          {profile?.user_type === 'vendor' ? 'Recent Orders' : 'Your Orders'}
        </h2>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
            <p className="text-gray-500">
              {profile?.user_type === 'vendor'
                ? 'Orders from customers will appear here'
                : 'Start shopping to see your orders here'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.id.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${order.total_amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}