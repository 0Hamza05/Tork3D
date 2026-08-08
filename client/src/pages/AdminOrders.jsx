import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, LogOut, Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { SEO } from '../components/SEO';

const TOKEN_KEY = 'tork3d_admin_token';
const PAGE_SIZE = 25;

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'paid', label: 'Paid' },
  { value: 'cod_pending', label: 'COD pending' },
  { value: 'payment_pending', label: 'Payment pending' },
  { value: 'lead_pending', label: 'Quote request' },
];

const STATUS_STYLES = {
  paid: 'bg-green-500/10 text-green-600 dark:text-green-400',
  cod_pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  payment_pending: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
  lead_pending: 'bg-accent-blue/10 text-accent-blue',
};

const formatDate = (iso) => new Date(iso).toLocaleString('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

// ── Login gate ────────────────────────────────────────────────────────────
function AdminLogin({ onLoggedIn }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem(TOKEN_KEY, data.token);
        onLoggedIn();
      } else {
        setError(data.message || 'Incorrect password.');
      }
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <SEO title="Admin" noindex />
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-5">
        <div className="flex flex-col items-center text-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-accent-orange/10 flex items-center justify-center">
            <Lock className="w-6 h-6 text-accent-orange" />
          </div>
          <h1 className="text-xl font-bold text-white">Tork3D Admin</h1>
          <p className="text-sm text-slate-400">Sign in to view orders.</p>
        </div>
        <input
          type="password"
          autoFocus
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-accent-orange"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full h-11 rounded-lg bg-accent-orange text-white font-semibold hover:bg-accent-orange/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

// ── Order row detail (expanded) ──────────────────────────────────────────
function OrderDetail({ order }) {
  const details = order.order_details || {};
  const items = Array.isArray(details.items) ? details.items : null;
  const addr = details.shippingAddress;

  return (
    <div className="bg-slate-950/60 border-t border-slate-800 px-6 py-5 space-y-4 text-sm">
      {items ? (
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Items</p>
          <ul className="space-y-1">
            {items.map((item, i) => (
              <li key={i} className="flex justify-between text-slate-300">
                <span>{item.quantity}x {item.name}{item.engraveName ? ` — Engrave: ${item.engraveName}` : ''}</span>
                <span className="text-slate-500">₹{item.price}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Details</p>
          <ul className="space-y-1 text-slate-300">
            {Object.entries(details).filter(([k]) => !['shippingAddress'].includes(k)).map(([k, v]) => (
              <li key={k}><span className="text-slate-500">{k}:</span> {String(v)}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Phone</p>
          <p className="text-slate-300">{details.customerPhone || '—'}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Payment ID</p>
          <p className="text-slate-300 break-all">{order.payment_id || '—'}</p>
        </div>
      </div>

      {addr && (
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Shipping Address</p>
          <p className="text-slate-300">{addr.address1}{addr.address2 ? `, ${addr.address2}` : ''}, {addr.city} - {addr.pincode}, {addr.state}</p>
        </div>
      )}

      {(details.couponCode || details.referredBy) && (
        <div className="grid grid-cols-2 gap-4">
          {details.couponCode && (
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Coupon</p>
              <p className="text-slate-300">{details.couponCode} (−₹{details.couponDiscount || 0}){details.freeKeychain ? ' · 🎁 free keychain' : ''}</p>
            </div>
          )}
          {details.referredBy && (
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Referral</p>
              <p className="text-slate-300">{details.referredBy}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────
function OrdersDashboard({ onLogout }) {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (status) params.set('status', status);
      if (search) params.set('search', search);
      const res = await fetch(`${API_BASE_URL}/api/admin/orders?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` },
      });
      if (res.status === 401) {
        onLogout();
        return;
      }
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        setTotal(data.total);
      } else {
        setError(data.message || 'Could not load orders.');
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, [page, status, search, onLogout]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SEO title="Admin" noindex />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Orders</h1>
          <button onClick={onLogout} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search name or email…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-orange"
            />
          </form>
          <select
            value={status}
            onChange={(e) => { setPage(1); setStatus(e.target.value); }}
            className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-orange"
          >
            {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium text-right">Total</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium w-8"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin inline-block" />
                  </td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No orders found.</td></tr>
                ) : orders.map(order => (
                  <React.Fragment key={order.id}>
                    <tr
                      onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                      className="border-b border-slate-800 last:border-0 hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 text-slate-400 whitespace-nowrap">{formatDate(order.created_at)}</td>
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{order.customer_name}</div>
                        <div className="text-slate-500 text-xs">{order.customer_email}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{order.order_type}</td>
                      <td className="px-6 py-4 text-right text-white font-medium">₹{order.total_amount}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[order.status] || 'bg-slate-500/10 text-slate-400'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {expandedId === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </td>
                    </tr>
                    {expandedId === order.id && (
                      <tr>
                        <td colSpan={6} className="p-0"><OrderDetail order={order} /></td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm text-slate-400">
            <span>Page {page} of {totalPages} · {total} orders</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Entry point ───────────────────────────────────────────────────────────
export default function AdminOrders() {
  const [loggedIn, setLoggedIn] = useState(() => !!localStorage.getItem(TOKEN_KEY));

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setLoggedIn(false);
  };

  if (!loggedIn) {
    return <AdminLogin onLoggedIn={() => setLoggedIn(true)} />;
  }
  return <OrdersDashboard onLogout={handleLogout} />;
}
