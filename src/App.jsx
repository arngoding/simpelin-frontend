import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Users, 
  ClipboardList, 
  LogOut, 
  Plus, 
  Minus,
  Check, 
  X, 
  ShoppingCart, 
  History, 
  Upload, 
  Edit3,
  AlertCircle,
  Search,
  Trash2,
  UserPlus,
  AlertTriangle
} from 'lucide-react';

// --- DATA AWAL (MOCK DATA) ---
const initialItems = [
  { id: 1, name: 'Kertas HVS A4 80gr', sku: 'ATK-001', stock: 150, category: 'Alat Tulis', unit: 'Rim' },
  { id: 2, name: 'Tinta Printer Epson Hitam', sku: 'PRN-012', stock: 25, category: 'Komputer', unit: 'Botol' },
  { id: 3, name: 'Mouse Wireless Logitech', sku: 'KOM-045', stock: 12, category: 'Komputer', unit: 'Pcs' },
  { id: 4, name: 'Spidol Whiteboard (Hitam)', sku: 'ATK-009', stock: 50, category: 'Alat Tulis', unit: 'Pcs' },
  { id: 5, name: 'Kursi Kantor Ergonomis', sku: 'FURN-002', stock: 5, category: 'Furnitur', unit: 'Unit' },
];

const initialUsers = [
  { id: 'admin', pass: 'admin123', name: 'admin', role: 'admin', bidang: 'UMUM' },
  { id: 'userumum', pass: 'adminumum', name: 'UMUM', role: 'user', bidang: 'UMUM' },
  { id: 'userKBP', pass: 'adminKBP', name: 'KBP', role: 'user', bidang: 'KBP' },
  { id: 'userhumas', pass: 'adminhumas', name: 'P2HUMAS', role: 'user', bidang: 'P2HUMAS' },
  { id: 'userppip', pass: 'adminppip', name: 'PPIP', role: 'user', bidang: 'PPIP' },
  { id: 'userpep', pass: 'adminpep', name: 'PEP', role: 'user', bidang: 'PEP' },
  { id: 'userdp3', pass: 'admindp3', name: 'DP3', role: 'user', bidang: 'DP3' },
  { id: 'userfpp', pass: 'adminfpp', name: 'Fungsional Pemeriksa Pajak', role: 'user', bidang: 'PEMERIKSA' },
];

const initialOrders = [
  { 
    id: 101, 
    reqNumber: '1/UMUM/BONATK/2026',
    userId: 'userumum', 
    userName: 'UMUM', 
    items: [{ id: 1, name: 'Kertas HVS A4 80gr', qty: 5, unit: 'Rim' }], 
    status: 'Menunggu', 
    date: '2026-03-04' 
  },
  { 
    id: 102, 
    reqNumber: '1/KBP/BONATK/2026',
    userId: 'userKBP', 
    userName: 'KBP', 
    items: [{ id: 3, name: 'Mouse Wireless Logitech', qty: 1, unit: 'Pcs' }], 
    status: 'Disetujui', 
    date: '2026-03-03' 
  },
];

export default function App() {
  // --- STATE MANAGEMENT ---
  const [currentUser, setCurrentUser] = useState(null);
  const [usersList, setUsersList] = useState(initialUsers);
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [cart, setCart] = useState([]);
  const [items, setItems] = useState([]); // <-- DIUBAH: Kosong pada awalnya agar mengambil dari database
  const [orders, setOrders] = useState(initialOrders);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Modal States
  const [isOpnameModalOpen, setIsOpnameModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // User Management States
  const [isUserFormModalOpen, setIsUserFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ id: '', pass: '', name: '', bidang: 'UMUM' });
  const [userToDelete, setUserToDelete] = useState(null);

  // Form States
  const [selectedItem, setSelectedItem] = useState(null);
  const [opnameStock, setOpnameStock] = useState('');
  const [importData, setImportData] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Inventory Filter States
  const [filterSku, setFilterSku] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterUnit, setFilterUnit] = useState('');
  const [itemToDelete, setItemToDelete] = useState(null);

  // Request Filter & Edit States
  const [filterReqStatuses, setFilterReqStatuses] = useState(['Menunggu', 'Disetujui', 'Ditolak']);
  const [filterReqDateStart, setFilterReqDateStart] = useState('');
  const [filterReqDateEnd, setFilterReqDateEnd] = useState('');
  const [isRequestEditMode, setIsRequestEditMode] = useState(false);
  const [isEditOrderModalOpen, setIsEditOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editOrderItems, setEditOrderItems] = useState([]);

  // Modal Add to Cart
  const [isAddToCartModalOpen, setIsAddToCartModalOpen] = useState(false);
  const [itemToAdd, setItemToAdd] = useState(null);
  const [addQty, setAddQty] = useState(1);

  // Toast/Notification State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- MENGAMBIL DATA DARI DATABASE ONLINE (VERCEL) ---
  useEffect(() => {
    fetch('https://api-simpelin.vercel.app/api/items')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setItems(data);
        }
      })
      .catch(err => console.error("Gagal mengambil data API:", err));
  }, []); // Array kosong berarti fungsi ini hanya dijalankan sekali saat aplikasi dibuka

  // --- LOGIC FUNCTIONS ---
  
  // Admin: Handle Stock Opname
  const handleOpnameSubmit = (e) => {
    e.preventDefault();
    const newStock = parseInt(opnameStock);
    if (isNaN(newStock) || newStock < 0) {
      showToast('Jumlah stok tidak valid', 'error');
      return;
    }

    // Mengirim update stok ke Database Online via API
    fetch(`https://api-simpelin.vercel.app/api/items/${selectedItem.id}/stock`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ stock: newStock })
    })
    .then(res => res.json())
    .then(data => {
      // Jika berhasil di database, baru update tampilan di layar
      setItems(items.map(item => 
        item.id === selectedItem.id ? { ...item, stock: newStock } : item
      ));
      
      showToast(`Stok ${selectedItem.name} berhasil diperbarui menjadi ${newStock}`);
      setIsOpnameModalOpen(false);
    })
    .catch(err => {
      console.error("Gagal update stok:", err);
      showToast('Gagal terhubung ke server', 'error');
    });
  };

  // Admin: Handle Delete Item
  const confirmDeleteItem = () => {
    if (!itemToDelete) return;
    setItems(items.filter(i => i.id !== itemToDelete.id));
    showToast('Barang berhasil dihapus');
    setItemToDelete(null);
  };

  // Admin: Handle Import Data
  const handleImportSubmit = (e) => {
    e.preventDefault();
    const lines = importData.trim().split('\n');
    const newItems = [];
    let errorCount = 0;

    lines.forEach((line, index) => {
      const parts = line.split(',');
      if (parts.length === 5) {
        newItems.push({
          id: Date.now() + index, // Generate ID sederhana
          name: parts[0].trim(),
          sku: parts[1].trim(),
          stock: parseInt(parts[2].trim()) || 0,
          category: parts[3].trim(),
          unit: parts[4].trim()
        });
      } else {
        errorCount++;
      }
    });

    if (newItems.length > 0) {
      setItems([...items, ...newItems]);
      showToast(`${newItems.length} barang berhasil diimpor.`);
      setIsImportModalOpen(false);
      setImportData('');
    } else {
      showToast('Format data tidak valid. Gunakan format: Nama, SKU, Stok, Kategori, Satuan', 'error');
    }
  };

  // Admin: Handle Order Approval/Rejection
  const handleOrderStatus = (orderId, newStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (newStatus === 'Disetujui') {
      // Check stock first
      for (let orderItem of order.items) {
        const item = items.find(i => i.id === orderItem.id);
        if (!item || item.stock < orderItem.qty) {
          showToast(`Stok ${item ? item.name : orderItem.name} tidak mencukupi!`, 'error');
          return;
        }
      }
      
      // Reduce stock
      let updatedItems = [...items];
      for (let orderItem of order.items) {
        updatedItems = updatedItems.map(i => 
          i.id === orderItem.id ? { ...i, stock: i.stock - orderItem.qty } : i
        );
      }
      setItems(updatedItems);
    }

    // Update order status
    setOrders(orders.map(o => 
      o.id === orderId ? { ...o, status: newStatus } : o
    ));
    
    showToast(`Permintaan berhasil ${newStatus.toLowerCase()}`);
  };

  // Admin: Request Filter & Edit Logic
  const handleStatusToggle = (status) => {
    setFilterReqStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const openEditOrderModal = (order) => {
    setEditingOrder(order);
    setEditOrderItems([...order.items]); // Copy item agar tidak merubah data asli sebelum disimpan
    setIsEditOrderModalOpen(true);
  };

  const handleUpdateEditOrderQty = (itemId, newQty) => {
    if (newQty < 1) return;
    setEditOrderItems(editOrderItems.map(item =>
      item.id === itemId ? { ...item, qty: newQty } : item
    ));
  };

  const handleRemoveEditOrderItem = (itemId) => {
    setEditOrderItems(editOrderItems.filter(item => item.id !== itemId));
  };

  const saveEditedOrder = () => {
    if (editOrderItems.length === 0) {
      // Hapus permintaan jika semua barang di dalamnya dihapus
      setOrders(orders.filter(o => o.id !== editingOrder.id));
      showToast('Permintaan dihapus karena tidak ada barang');
    } else {
      setOrders(orders.map(o =>
        o.id === editingOrder.id ? { ...o, items: editOrderItems } : o
      ));
      showToast('Data barang dalam permintaan berhasil diperbarui');
    }
    setIsEditOrderModalOpen(false);
    setIsRequestEditMode(false);
  };

  // Admin: User Management Logic
  const openAddUserModal = () => {
    setEditingUser(null);
    setUserForm({ id: '', pass: '', name: '', bidang: 'UMUM' });
    setIsUserFormModalOpen(true);
  };

  const openEditUserModal = (user) => {
    setEditingUser(user);
    setUserForm({ id: user.id, pass: user.pass, name: user.name, bidang: user.bidang });
    setIsUserFormModalOpen(true);
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (editingUser) {
      // Update
      if (userForm.id !== editingUser.id && usersList.some(u => u.id === userForm.id)) {
        showToast('ID Pengguna sudah digunakan oleh akun lain!', 'error');
        return;
      }
      setUsersList(usersList.map(u => u.id === editingUser.id ? { ...userForm, role: u.role } : u));
      showToast('Data pengguna berhasil diperbarui');
    } else {
      // Add
      if (usersList.some(u => u.id === userForm.id)) {
        showToast('ID Pengguna sudah digunakan!', 'error');
        return;
      }
      setUsersList([...usersList, { ...userForm, role: 'user' }]);
      showToast('Pengguna baru berhasil ditambahkan');
    }
    setIsUserFormModalOpen(false);
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    setUsersList(usersList.filter(u => u.id !== userToDelete.id));
    showToast('Pengguna berhasil dihapus');
    setUserToDelete(null);
  };

  // User: E-commerce Cart Functions
  const openAddToCartModal = (item) => {
    setItemToAdd(item);
    setAddQty(1);
    setIsAddToCartModalOpen(true);
  };

  const confirmAddToCart = (e) => {
    e.preventDefault();
    const qtyToAdd = parseInt(addQty);
    
    if (isNaN(qtyToAdd) || qtyToAdd < 1) {
      showToast('Jumlah tidak valid', 'error');
      return;
    }

    const existingItem = cart.find(cartItem => cartItem.id === itemToAdd.id);
    const currentCartQty = existingItem ? existingItem.qty : 0;

    if (currentCartQty + qtyToAdd > itemToAdd.stock) {
      showToast(`Total permintaan melebihi sisa stok (${itemToAdd.stock - currentCartQty} Unit tersisa)`, 'error');
      return;
    }

    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === itemToAdd.id ? { ...cartItem, qty: cartItem.qty + qtyToAdd } : cartItem
      ));
    } else {
      setCart([...cart, { ...itemToAdd, qty: qtyToAdd }]);
    }
    
    showToast(`${qtyToAdd} unit ${itemToAdd.name} ditambahkan ke keranjang`);
    setIsAddToCartModalOpen(false);
  };

  const updateCartQty = (itemId, newQty) => {
    const item = items.find(i => i.id === itemId);
    if (newQty > item.stock) {
      showToast('Melebihi stok yang tersedia', 'error');
      return;
    }
    if (newQty < 1) return;
    
    setCart(cart.map(cartItem => 
      cartItem.id === itemId ? { ...cartItem, qty: newQty } : cartItem
    ));
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    // Generate Nomor Permintaan Otomatis sesuai Bidang
    const userBidang = currentUser.bidang;
    const bidangOrders = orders.filter(o => o.reqNumber.includes(`/${userBidang}/BONATK/`));
    const nextSeq = bidangOrders.length + 1;
    const reqNumber = `${nextSeq}/${userBidang}/BONATK/2026`;

    const newOrder = {
      id: Date.now(),
      reqNumber: reqNumber,
      userId: currentUser.id,
      userName: currentUser.name,
      items: [...cart],
      status: 'Menunggu',
      date: new Date().toISOString().split('T')[0]
    };

    setOrders([newOrder, ...orders]);
    setCart([]); // Kosongkan keranjang
    setActiveTab('history');
    showToast('Permintaan barang berhasil diajukan!');
  };

  // --- RENDER HELPERS ---
  const adminFilteredItems = items.filter(item => {
    const matchGlobal = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSku = item.sku.toLowerCase().includes(filterSku.toLowerCase());
    const matchName = item.name.toLowerCase().includes(filterName.toLowerCase());
    const matchCategory = item.category.toLowerCase().includes(filterCategory.toLowerCase());
    const matchUnit = item.unit.toLowerCase().includes(filterUnit.toLowerCase());
    
    return matchGlobal && matchSku && matchName && matchCategory && matchUnit;
  });

  const userFilteredItems = items.filter(item => {
    return item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           item.sku.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredOrders = orders.filter(o => {
    const matchStatus = filterReqStatuses.includes(o.status);
    let matchDate = true;
    if (filterReqDateStart && filterReqDateEnd) {
      matchDate = o.date >= filterReqDateStart && o.date <= filterReqDateEnd;
    } else if (filterReqDateStart) {
      matchDate = o.date >= filterReqDateStart;
    } else if (filterReqDateEnd) {
      matchDate = o.date <= filterReqDateEnd;
    }
    return matchStatus && matchDate;
  });

  const pendingOrdersCount = orders.filter(o => o.status === 'Menunggu').length;
  const cartItemsCount = cart.reduce((total, item) => total + item.qty, 0);

  // --- UI COMPONENTS ---
  
  // Login Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        {/* --- TOAST NOTIFICATION UNTUK LOGIN --- */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 text-white animate-fade-in-down ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
            {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
            <span>{toast.message}</span>
          </div>
        )}
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="bg-blue-100 p-4 rounded-full inline-block mb-4">
            <Package className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Sistem Manajemen Pengelolaan Inventory</h1>
          <p className="text-gray-500 mb-6">Silakan masuk menggunakan ID dan Kata Sandi</p>
          
          <form 
            className="space-y-4 text-left"
            onSubmit={(e) => {
              e.preventDefault();
              const user = usersList.find(u => u.id === loginId && u.pass === loginPass);
              if(user) {
                setCurrentUser(user);
                setActiveTab(user.role === 'admin' ? 'inventory' : 'catalog');
                setLoginId('');
                setLoginPass('');
              } else {
                showToast('ID atau Kata Sandi salah!', 'error');
              }
            }}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Pengguna</label>
              <input 
                type="text" 
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Masukkan ID Pengguna"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kata Sandi</label>
              <input 
                type="password" 
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Masukkan Kata Sandi"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition mt-2"
            >
              Masuk
            </button>
          </form>
        </div>
        
        {/* --- CREDIT FOOTER LOGIN --- */}
        <div className="mt-8 text-xs text-gray-400 opacity-60 text-center animate-fade-in hover:opacity-100 transition-opacity cursor-default">
          Dikembangkan Oleh : <span className="font-medium">TURT Kanwil DJP Jakarta Barat 2026</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* --- TOAST NOTIFICATION --- */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 text-white animate-fade-in-down ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* --- SIDEBAR --- */}
      <aside className="bg-slate-800 text-white w-full md:w-64 flex-shrink-0 md:min-h-screen">
        <div className="p-4 flex items-center space-x-3 border-b border-slate-700">
          <Package className="w-8 h-8 text-blue-400" />
          <span className="font-bold text-lg tracking-wide">SiMPelIn</span>
        </div>
        
        <nav className="p-4 space-y-2">
      {currentUser.role === 'admin' ? (
        <>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === 'inventory' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
              >
                <ClipboardList className="w-5 h-5" />
                <span>Data Stok Barang</span>
              </button>
              <button 
                onClick={() => setActiveTab('requests')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition relative ${activeTab === 'requests' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
              >
                <ClipboardList className="w-5 h-5" />
                <span>Permintaan Barang</span>
                {pendingOrdersCount > 0 && (
              <span className="absolute right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {pendingOrdersCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === 'users' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
          >
            <Users className="w-5 h-5" />
            <span>Manajemen User</span>
          </button>
        </>
      ) : (
        <>
          <button 
            onClick={() => setActiveTab('catalog')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === 'catalog' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
          >
            <Package className="w-5 h-5" />
            <span>Katalog Barang</span>
          </button>
          <button 
            onClick={() => setActiveTab('cart')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition relative ${activeTab === 'cart' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Keranjang</span>
            {cartItemsCount > 0 && (
              <span className="absolute right-4 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {cartItemsCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === 'history' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
          >
            <History className="w-5 h-5" />
            <span>Riwayat Permintaan</span>
          </button>
        </>
      )}
    </nav>

    <div className="p-4 mt-auto border-t border-slate-700 md:absolute md:bottom-0 md:w-64">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
          <Users className="w-6 h-6 text-slate-300" />
        </div>
        <div>
          <p className="text-sm font-medium">{currentUser.name}</p>
          <p className="text-xs text-slate-400 capitalize">{currentUser.role === 'admin' ? 'Admin' : currentUser.bidang}</p>
        </div>
      </div>
      <button 
        onClick={() => { 
          setCurrentUser(null); 
          setCart([]); 
          setSearchQuery('');
          setFilterSku('');
          setFilterName('');
          setFilterCategory('');
          setFilterUnit('');
        }}
        className="w-full flex items-center space-x-2 text-slate-300 hover:text-white hover:bg-red-500 hover:bg-opacity-20 px-4 py-2 rounded transition"
      >
        <LogOut className="w-4 h-4" />
        <span>Keluar</span>
      </button>
    </div>
  </aside>

  {/* --- MAIN CONTENT --- */}
  <main className="flex-1 p-4 md:p-8 overflow-y-auto">
    
    {/* VIEW ADMIN: DATA STOK */}
    {currentUser.role === 'admin' && activeTab === 'inventory' && (
      <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Data Stok Barang</h2>
                <p className="text-gray-500">Kelola persediaan dan lakukan stok opname.</p>
              </div>
              <div className="flex space-x-3 w-full md:w-auto">
                <button 
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import Data</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="text" 
                    placeholder="Cari nama barang atau Kode Barang..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-sm align-top">
                      <th className="p-4 border-b font-medium w-32">
                        <div className="mb-2">Kode Barang</div>
                        <input type="text" placeholder="Filter..." className="w-full px-2 py-1 text-xs border border-gray-300 rounded font-normal outline-none focus:border-blue-500" value={filterSku} onChange={e => setFilterSku(e.target.value)} />
                      </th>
                      <th className="p-4 border-b font-medium min-w-[200px]">
                        <div className="mb-2">Nama Barang</div>
                        <input type="text" placeholder="Filter..." className="w-full px-2 py-1 text-xs border border-gray-300 rounded font-normal outline-none focus:border-blue-500" value={filterName} onChange={e => setFilterName(e.target.value)} />
                      </th>
                      <th className="p-4 border-b font-medium w-32">
                        <div className="mb-2">Kategori</div>
                        <input type="text" placeholder="Filter..." className="w-full px-2 py-1 text-xs border border-gray-300 rounded font-normal outline-none focus:border-blue-500" value={filterCategory} onChange={e => setFilterCategory(e.target.value)} />
                      </th>
                      <th className="p-4 border-b font-medium w-24">
                        <div className="mb-2">Satuan</div>
                        <input type="text" placeholder="Filter..." className="w-full px-2 py-1 text-xs border border-gray-300 rounded font-normal outline-none focus:border-blue-500" value={filterUnit} onChange={e => setFilterUnit(e.target.value)} />
                      </th>
                      <th className="p-4 border-b font-medium w-28">
                        <div className="mb-2">Stok Aktual</div>
                      </th>
                      <th className="p-4 border-b font-medium text-right min-w-[140px]">
                        <div className="mb-2">Aksi</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminFilteredItems.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50 border-b border-gray-50 last:border-none">
                        <td className="p-4 text-sm font-mono text-gray-500">{item.sku}</td>
                        <td className="p-4 font-medium text-gray-800">{item.name}</td>
                        <td className="p-4 text-sm text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded-md">{item.category}</span>
                        </td>
                        <td className="p-4 text-sm text-gray-600">{item.unit}</td>
                        <td className="p-4">
                          <span className={`font-bold ${item.stock <= 10 ? 'text-red-500' : 'text-green-600'}`}>
                            {item.stock}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          <button 
                            onClick={() => {
                              setSelectedItem(item);
                              setOpnameStock(item.stock.toString());
                              setIsOpnameModalOpen(true);
                            }}
                            className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition text-sm font-medium"
                            title="Opname Stok"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setItemToDelete(item)}
                            className="inline-flex items-center space-x-1 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition text-sm font-medium"
                            title="Hapus Barang"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {adminFilteredItems.length === 0 && (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-gray-500">Barang tidak ditemukan.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

    {/* VIEW ADMIN: PERMINTAAN BARANG */}
    {currentUser.role === 'admin' && activeTab === 'requests' && (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Permintaan Barang</h2>
            <p className="text-gray-500">Tinjau dan proses permintaan barang dari staff.</p>
          </div>
          <button
            onClick={() => setIsRequestEditMode(!isRequestEditMode)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition ${isRequestEditMode ? 'bg-blue-100 text-blue-700' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            <Edit3 className="w-4 h-4" />
            <span>{isRequestEditMode ? 'Selesai Edit' : 'Edit Permintaan'}</span>
          </button>
        </div>

        {/* Filter Permintaan */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 md:items-center">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            {['Menunggu', 'Disetujui', 'Ditolak'].map(status => (
              <label key={status} className="flex items-center space-x-1 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterReqStatuses.includes(status)}
                  onChange={() => handleStatusToggle(status)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>{status}</span>
              </label>
            ))}
          </div>
          <div className="flex items-center space-x-2 md:ml-auto">
            <span className="text-sm font-medium text-gray-700">Tanggal:</span>
            <input
              type="date"
              value={filterReqDateStart}
              onChange={(e) => setFilterReqDateStart(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500"
            />
            <span className="text-sm text-gray-500">-</span>
            <input
              type="date"
              value={filterReqDateEnd}
              onChange={(e) => setFilterReqDateEnd(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm">
                  <th className="p-4 border-b font-medium">No. Permintaan</th>
                  <th className="p-4 border-b font-medium">Tanggal</th>
                  <th className="p-4 border-b font-medium">Pemohon</th>
                  <th className="p-4 border-b font-medium">Daftar Barang</th>
                  <th className="p-4 border-b font-medium">Status</th>
                  <th className="p-4 border-b font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 border-b border-gray-50 last:border-none">
                    <td className="p-4 text-sm font-mono font-medium text-blue-600">{order.reqNumber}</td>
                    <td className="p-4 text-sm text-gray-500">{order.date}</td>
                    <td className="p-4 font-medium text-gray-800">{order.userName}</td>
                    <td className="p-4">
                      <ul className="text-sm font-medium text-gray-800 space-y-1">
                        {order.items.map((item, idx) => (
                          <li key={idx}>
                            - {item.name} <span className="text-blue-600 bg-blue-50 px-1 rounded ml-1">x{item.qty} {item.unit}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full 
                        ${order.status === 'Menunggu' ? 'bg-yellow-100 text-yellow-700' : 
                          order.status === 'Disetujui' ? 'bg-green-100 text-green-700' : 
                          'bg-red-100 text-red-700'}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                          {isRequestEditMode ? (
                            <button
                              onClick={() => openEditOrderModal(order)}
                              className="inline-flex items-center justify-center p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                              title="Edit Item Permintaan"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          ) : order.status === 'Menunggu' ? (
                            <>
                              <button 
                                onClick={() => handleOrderStatus(order.id, 'Disetujui')}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition"
                                title="Setujui"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleOrderStatus(order.id, 'Ditolak')}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition"
                                title="Tolak"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400 italic">Selesai</span>
                          )}
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">Permintaan barang tidak ditemukan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}

    {/* VIEW ADMIN: MANAJEMEN USER */}
    {currentUser.role === 'admin' && activeTab === 'users' && (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h2>
            <p className="text-gray-500">Kelola akun, ID, dan Kata Sandi pengguna aplikasi.</p>
          </div>
          <button 
            onClick={openAddUserModal}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah User</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm">
                  <th className="p-4 border-b font-medium">ID Login</th>
                  <th className="p-4 border-b font-medium">Kata Sandi</th>
                  <th className="p-4 border-b font-medium">Nama / Alias</th>
                  <th className="p-4 border-b font-medium">Bidang / Bagian</th>
                  <th className="p-4 border-b font-medium">Tipe</th>
                  <th className="p-4 border-b font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 border-b border-gray-50 last:border-none">
                    <td className="p-4 font-mono font-medium text-blue-600">{user.id}</td>
                    <td className="p-4 font-mono text-gray-500 text-sm">{user.pass}</td>
                    <td className="p-4 font-medium text-gray-800">{user.name}</td>
                    <td className="p-4 text-gray-600">{user.bidang}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-md ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => openEditUserModal(user)}
                        className="inline-flex items-center justify-center p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                        title="Edit User"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          if (user.id === currentUser.id) {
                            showToast('Anda tidak dapat menghapus akun Anda sendiri!', 'error');
                            return;
                          }
                          setUserToDelete(user);
                        }}
                        className={`inline-flex items-center justify-center p-2 rounded-lg transition ${user.id === currentUser.id ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                        title="Hapus User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}

    {/* VIEW USER: KATALOG BARANG */}
    {currentUser.role === 'user' && activeTab === 'catalog' && (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Katalog Gudang</h2>
          <p className="text-gray-500">Pilih barang yang Anda butuhkan untuk operasional.</p>
        </div>

        <div className="relative w-full max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Cari barang..." 
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userFilteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                  {item.category}
                </div>
                <span className="text-xs font-mono text-gray-400">{item.sku}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">{item.name}</h3>
              <div className="mb-6">
                <span className="text-sm text-gray-500">Sisa Stok: </span>
                <span className={`font-bold ${item.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {item.stock > 0 ? `${item.stock} ${item.unit}` : 'Habis'}
                </span>
              </div>
              <div className="mt-auto">
                <button 
                  disabled={item.stock === 0}
                  onClick={() => openAddToCartModal(item)}
                  className={`w-full py-2.5 rounded-lg flex items-center justify-center space-x-2 font-medium transition
                    ${item.stock > 0 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>{item.stock > 0 ? 'Tambah ke Keranjang' : 'Stok Kosong'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* VIEW USER: KERANJANG */}
    {currentUser.role === 'user' && activeTab === 'cart' && (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Keranjang Permintaan</h2>
          <p className="text-gray-500">Tinjau barang yang ingin Anda minta sebelum mengajukan.</p>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600">Keranjang Anda kosong</h3>
            <p className="text-gray-400 mt-2">Silakan pilih barang dari katalog terlebih dahulu.</p>
            <button 
              onClick={() => setActiveTab('catalog')}
              className="mt-6 px-6 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition"
            >
              Lihat Katalog
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm">
                    <th className="p-4 border-b font-medium">Nama Barang</th>
                    <th className="p-4 border-b font-medium text-center">Jumlah</th>
                    <th className="p-4 border-b font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(item => (
                    <tr key={item.id} className="border-b border-gray-50 last:border-none">
                      <td className="p-4">
                        <div className="font-bold text-gray-800">{item.name}</div>
                        <div className="text-xs text-gray-400 font-mono">{item.sku} - Satuan: {item.unit}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center space-x-3">
                          <button 
                            onClick={() => updateCartQty(item.id, item.qty - 1)}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-bold w-6 text-center">{item.qty}</span>
                          <button 
                            onClick={() => updateCartQty(item.id, item.qty + 1)}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-gray-600">
                Total Item: <span className="font-bold text-gray-800">{cartItemsCount}</span>
              </div>
              <button 
                onClick={handleCheckout}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center justify-center w-full sm:w-auto space-x-2 transition shadow-md"
              >
                <Check className="w-5 h-5" />
                <span>Ajukan Permintaan Sekarang</span>
              </button>
            </div>
          </div>
        )}
      </div>
    )}

    {/* VIEW USER: RIWAYAT */}
    {currentUser.role === 'user' && activeTab === 'history' && (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Riwayat Permintaan</h2>
          <p className="text-gray-500">Lacak status permintaan barang Anda di sini.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm">
                  <th className="p-4 border-b font-medium">No. Permintaan</th>
                  <th className="p-4 border-b font-medium">Tanggal</th>
                  <th className="p-4 border-b font-medium">Daftar Barang</th>
                  <th className="p-4 border-b font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.filter(o => o.userId === currentUser.id).map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 border-b border-gray-50 last:border-none">
                    <td className="p-4 text-sm font-mono font-medium text-blue-600">{order.reqNumber}</td>
                    <td className="p-4 text-sm text-gray-500">{order.date}</td>
                    <td className="p-4">
                      <ul className="text-sm font-medium text-gray-800 space-y-1">
                        {order.items.map((item, idx) => (
                          <li key={idx}>
                            - {item.name} <span className="text-gray-500 ml-1">x{item.qty} {item.unit}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full 
                        ${order.status === 'Menunggu' ? 'bg-yellow-100 text-yellow-700' : 
                          order.status === 'Disetujui' ? 'bg-green-100 text-green-700' : 
                          'bg-red-100 text-red-700'}`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {orders.filter(o => o.userId === currentUser.id).length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500">Belum ada riwayat permintaan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}

    {/* --- CREDIT FOOTER DASHBOARD --- */}
    <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-400 opacity-60 hover:opacity-100 transition-opacity cursor-default pb-4">
      Dikembangkan Oleh : <span className="font-medium">TURT Kanwil DJP Jakarta Barat 2026</span>
    </div>

  </main>

  {/* --- MODALS --- */}
  
  {/* Modal Stok Opname (Admin) */}
      {isOpnameModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-gray-800">Stok Opname</h3>
              <button onClick={() => setIsOpnameModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Sesuaikan stok aktual fisik untuk <strong className="text-gray-800">{selectedItem.name}</strong> ({selectedItem.sku}).
            </p>
            <form onSubmit={handleOpnameSubmit}>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">Stok Fisik Aktual</label>
                <input 
                  type="number" 
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={opnameStock}
                  onChange={(e) => setOpnameStock(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsOpnameModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Import Data (Admin) */}
  {isImportModalOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-gray-800">Import Data Barang</h3>
          <button onClick={() => setIsImportModalOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Masukkan data barang dengan format <code className="bg-gray-100 px-1 rounded text-pink-600">Nama Barang, Kode Barang, StokAwal, Kategori, Satuan</code> per baris.
        </p>
        <form onSubmit={handleImportSubmit}>
          <div className="mb-5">
            <textarea 
              rows="6"
              placeholder="Contoh:&#10;Buku Tulis, ATK-020, 100, Alat Tulis, Rim&#10;Kabel LAN 5m, KOM-011, 30, Komputer, Pcs"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm resize-none"
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={() => setIsImportModalOpen(false)}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              Import Data
            </button>
          </div>
        </form>
      </div>
    </div>
  )}

  {/* Modal Tambah ke Keranjang (User) */}
  {isAddToCartModalOpen && itemToAdd && (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-gray-800">Tambah ke Keranjang</h3>
          <button onClick={() => setIsAddToCartModalOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-5 border border-blue-100">
          <h4 className="font-bold text-blue-900">{itemToAdd.name}</h4>
          <p className="text-sm text-blue-700 mt-1">Stok tersedia: {itemToAdd.stock} {itemToAdd.unit}</p>
          {cart.find(c => c.id === itemToAdd.id) && (
            <p className="text-xs text-blue-600 mt-1 italic">
              (Sudah ada {cart.find(c => c.id === itemToAdd.id).qty} {itemToAdd.unit} di keranjang)
            </p>
          )}
        </div>

        <form onSubmit={confirmAddToCart}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Unit ({itemToAdd.unit})</label>
            <input 
              type="number" 
              min="1"
              max={itemToAdd.stock - (cart.find(c => c.id === itemToAdd.id)?.qty || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg"
              value={addQty}
              onChange={(e) => setAddQty(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={() => setIsAddToCartModalOpen(false)}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center space-x-2 transition"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Tambah</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )}

  {/* Modal Form User (Tambah/Edit) */}
  {isUserFormModalOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-gray-800">
            {editingUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
          </h3>
          <button onClick={() => setIsUserFormModalOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSaveUser}>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama / Alias</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={userForm.id}
                onChange={(e) => setUserForm({...userForm, id: e.target.value.replace(/\s+/g, '')})}
                required
                disabled={editingUser && editingUser.id === currentUser.id} // cegah ubah ID sendiri dari sini
              />
              <p className="text-xs text-gray-500 mt-1">Digunakan untuk login. Tanpa spasi.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kata Sandi</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={userForm.pass}
                onChange={(e) => setUserForm({...userForm, pass: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama / Alias (Akan tampil pada Nomor Order)</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={userForm.name}
                onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bidang / Bagian</label>
              <select 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
                value={userForm.bidang}
                onChange={(e) => setUserForm({...userForm, bidang: e.target.value})}
                required
              >
                <option value="UMUM">UMUM</option>
                <option value="KBP">KBP</option>
                <option value="P2HUMAS">P2HUMAS</option>
                <option value="PPIP">PPIP</option>
                <option value="PEP">PEP</option>
                <option value="DP3">DP3</option>
                <option value="PEMERIKSA">PEMERIKSA</option>
                <option value="PENYULUH">PENYULUH</option>
                <option value="PENILAI">PENILAI</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={() => setIsUserFormModalOpen(false)}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              Simpan Data
            </button>
          </div>
        </form>
      </div>
    </div>
  )}

  {/* Modal Konfirmasi Hapus User */}
  {userToDelete && (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Hapus Pengguna?</h3>
        <p className="text-gray-600 mb-6">
          Anda yakin ingin menghapus akun <strong>{userToDelete.id}</strong>? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex justify-center space-x-3">
          <button 
            type="button" 
            onClick={() => setUserToDelete(null)}
            className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
          >
            Batal
          </button>
          <button 
            type="button" 
            onClick={confirmDeleteUser}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Modal Konfirmasi Hapus Barang */}
  {itemToDelete && (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Hapus Barang?</h3>
        <p className="text-gray-600 mb-6">
          Anda yakin ingin menghapus <strong>{itemToDelete.name}</strong> dari daftar stok?
        </p>
        <div className="flex justify-center space-x-3">
          <button 
            type="button" 
            onClick={() => setItemToDelete(null)}
            className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
          >
            Batal
          </button>
          <button 
            type="button" 
            onClick={confirmDeleteItem}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Modal Edit Permintaan (Admin) */}
  {isEditOrderModalOpen && editingOrder && (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-gray-800">Edit Permintaan</h3>
          <button onClick={() => setIsEditOrderModalOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
          Nomor: <span className="font-mono font-bold text-blue-600">{editingOrder.reqNumber}</span><br/>
          Pemohon: <span className="font-bold">{editingOrder.userName}</span>
        </div>

        <div className="max-h-64 overflow-y-auto mb-5 border border-gray-200 rounded-lg p-2">
          {editOrderItems.length === 0 ? (
            <p className="text-center text-gray-500 py-6">Tidak ada barang. Permintaan akan dihapus jika disimpan.</p>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <tbody>
                {editOrderItems.map(item => (
                  <tr key={item.id} className="border-b border-gray-100 last:border-none">
                    <td className="py-3 px-2">
                      <div className="font-bold text-gray-800">{item.name}</div>
                      <div className="text-xs text-gray-400">Satuan: {item.unit}</div>
                    </td>
                    <td className="py-3 px-2 w-32">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleUpdateEditOrderQty(item.id, item.qty - 1)} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"><Minus className="w-4 h-4" /></button>
                        <span className="font-bold w-6 text-center">{item.qty}</span>
                        <button onClick={() => handleUpdateEditOrderQty(item.id, item.qty + 1)} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"><Plus className="w-4 h-4" /></button>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button onClick={() => handleRemoveEditOrderItem(item.id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button onClick={() => setIsEditOrderModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition">Batal</button>
          <button onClick={saveEditedOrder} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">Simpan Perubahan</button>
        </div>
      </div>
    </div>
  )}

  {/* Global Styles added via inline style for specific animations not in standard tailwind */}
  <style dangerouslySetInnerHTML={{__html: `
    @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        .animate-fade-in-down { animation: fadeInDown 0.3s ease-out; }
      `}} />
    </div>
  );
}