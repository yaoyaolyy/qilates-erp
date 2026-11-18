import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, collection, doc, setDoc, updateDoc, deleteDoc, 
  onSnapshot, writeBatch, getDocs 
} from 'firebase/firestore';
import { 
  Package, ShoppingBag, BarChart3, Plus, ArrowRight, CheckCircle2, 
  Truck, RefreshCw, Layers, DollarSign, Warehouse, Sparkles, 
  AlertCircle, Box, FileText, Gift, RotateCcw, Send, Check, X, Globe,
  Home, ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen, 
  Calculator, Clock, Calendar, HelpCircle
} from 'lucide-react';

// ============================================================================
// 1. Firebase 初始化与全局配置
// ============================================================================
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'qilates-erp-v1';

// ============================================================================
// 2. 初始演示数据定义 (匹配 QILATES 提案真实业务参数)
// ============================================================================
const INITIAL_SKUS = [
  {
    id: 'QLT-MAT-001',
    sku: 'QLT-MAT-001',
    name: '指压垫 160×60 (Acupressure Mat)',
    category: 'FINISHED',
    unit: '套',
    purchasePriceCny: 86.00,
    retailPriceUsd: 49.00,
    weightKg: 2.4,
    usageTag: '核心成品',
    domesticStock: 450,
    overseasStock: 134,
    inTransitStock: 200,
    safetyStock: 100,
    bom: [
      { sku: 'Pkg-Box-01', qty: 1 },
      { sku: 'Pkg-Card-01', qty: 1 },
      { sku: 'Pkg-Manual-01', qty: 1 }
    ]
  },
  {
    id: 'Pkg-Box-01',
    sku: 'Pkg-Box-01',
    name: '品牌彩色外箱',
    category: 'ACCESSORY',
    unit: '个',
    purchasePriceCny: 3.20,
    retailPriceUsd: 0,
    weightKg: 0.25,
    usageTag: '销售包材',
    domesticStock: 1200,
    overseasStock: 1314,
    inTransitStock: 0,
    safetyStock: 300,
    bom: []
  },
  {
    id: 'Pkg-Card-01',
    sku: 'Pkg-Card-01',
    name: 'QILATES 品牌感谢卡',
    category: 'ACCESSORY',
    unit: '张',
    purchasePriceCny: 0.80,
    retailPriceUsd: 0,
    weightKg: 0.02,
    usageTag: '销售包材',
    domesticStock: 1500,
    overseasStock: 1400,
    inTransitStock: 0,
    safetyStock: 400,
    bom: []
  },
  {
    id: 'Pkg-Manual-01',
    sku: 'Pkg-Manual-01',
    name: '中英双语使用说明书',
    category: 'ACCESSORY',
    unit: '本',
    purchasePriceCny: 1.50,
    retailPriceUsd: 0,
    weightKg: 0.05,
    usageTag: '销售包材',
    domesticStock: 1500,
    overseasStock: 1400,
    inTransitStock: 0,
    safetyStock: 400,
    bom: []
  },
  {
    id: 'Gift-Pouch-01',
    sku: 'Gift-Pouch-01',
    name: '有机棉麻定制收纳袋',
    category: 'ACCESSORY',
    unit: '个',
    purchasePriceCny: 6.50,
    retailPriceUsd: 0,
    weightKg: 0.15,
    usageTag: '达人赠品',
    domesticStock: 600,
    overseasStock: 320,
    inTransitStock: 0,
    safetyStock: 100,
    bom: []
  }
];

const INITIAL_ORDERS = [
  {
    id: 'SO-20261117-0001',
    orderNo: 'SO-20261117-0001',
    orderType: 'SALES',
    channel: '独立站 Shopify',
    warehouse: 'OVERSEAS',
    sku: 'QLT-MAT-001',
    qty: 2,
    customerName: 'Elena Vance (US-CA)',
    status: 'SHIPPED',
    trackingNo: '1Z999AA10123456784',
    revenueUsd: 98.00,
    goodsCostCny: 172.00,
    bomCostCny: 11.00,
    firstLegCny: 24.00,
    lastMileUsd: 11.50,
    createdAt: '2026-11-17 09:24'
  },
  {
    id: 'SO-20261117-0002',
    orderNo: 'SO-20261117-0002',
    orderType: 'GIFTING',
    channel: '达人寄送手工单',
    warehouse: 'OVERSEAS',
    sku: 'QLT-MAT-001',
    qty: 1,
    customerName: '@MayaWellness (IG Influencer)',
    status: 'PUSHED_LX',
    trackingNo: '待仓库出库回传',
    revenueUsd: 0.00,
    goodsCostCny: 86.00,
    bomCostCny: 12.00,
    firstLegCny: 12.00,
    lastMileUsd: 6.20,
    createdAt: '2026-11-17 11:05'
  },
  {
    id: 'SO-20261117-0003',
    orderNo: 'SO-20261117-0003',
    orderType: 'SALES',
    channel: '微信小程序',
    warehouse: 'DOMESTIC',
    sku: 'QLT-MAT-001',
    qty: 1,
    customerName: '林小姐 (上海徐汇)',
    status: 'DELIVERED',
    trackingNo: 'SF1429883710293',
    revenueUsd: 49.00,
    goodsCostCny: 86.00,
    bomCostCny: 5.50,
    firstLegCny: 0.00,
    lastMileUsd: 1.40,
    createdAt: '2026-11-16 18:40'
  }
];

const INITIAL_SHIPMENTS = [
  {
    id: 'SHP-202611-01',
    shipmentNo: 'SHP-202611-01',
    sku: 'QLT-MAT-001',
    qty: 200,
    channel: '美西海运快船 (Matson)',
    freightCny: 2400.00,
    status: 'IN_TRANSIT',
    createdAt: '2026-11-10'
  }
];

// ============================================================================
// 3. 主应用组件 (QILATES ERP)
// ============================================================================
export default function App() {
  const [user, setUser] = useState(null);
  const [syncStatus, setSyncStatus] = useState('connecting');

  // 导航与多 Tab 页签
  const [activeTab, setActiveTab] = useState('dashboard');
  const [openTabs, setOpenTabs] = useState([
    { id: 'dashboard', label: '首页工作台', closable: false },
    { id: 'orders', label: '全渠道订单与出库', closable: true },
    { id: 'inventory', label: 'SKU 双仓库存 & BOM', closable: true },
    { id: 'finance', label: '三段成本与进销存', closable: true }
  ]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({
    orderGroup: true,
    warehouseGroup: true,
    financeGroup: true
  });
  const [lastUpdatedTime, setLastUpdatedTime] = useState(() =>
    new Date().toLocaleString('zh-CN', { hour12: false })
  );

  const navigateToTab = (tabId, label) => {
    setActiveTab(tabId);
    setOpenTabs(prev => {
      if (prev.some(t => t.id === tabId)) return prev;
      return [...prev, { id: tabId, label, closable: tabId !== 'dashboard' }];
    });
  };

  const closeTab = (e, tabId) => {
    e.stopPropagation();
    if (tabId === 'dashboard') return;
    setOpenTabs(prev => {
      const next = prev.filter(t => t.id !== tabId);
      if (activeTab === tabId) {
        const fallback = next[next.length - 1] || { id: 'dashboard' };
        setActiveTab(fallback.id);
      }
      return next;
    });
  };

  // 核心数据状态
  const [skus, setSkus] = useState([]);
  const [orders, setOrders] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [exchangeRate, setExchangeRate] = useState(7.15);
  const [monthlyStorageUsd, setMonthlyStorageUsd] = useState(185.00);

  // Toast 提示
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 全局二次确认弹窗状态
  const [confirmModal, setConfirmModal] = useState(null);
  const [isConfirmExecuting, setIsConfirmExecuting] = useState(false);

  const openConfirmModal = ({ title, message, details = [], confirmText = '确认执行', onConfirm }) => {
    setConfirmModal({ title, message, details, confirmText, onConfirm });
  };

  const handleConfirmExecute = async () => {
    if (!confirmModal?.onConfirm || isConfirmExecuting) return;
    setIsConfirmExecuting(true);
    try {
      await confirmModal.onConfirm();
      setConfirmModal(null);
    } finally {
      setIsConfirmExecuting(false);
    }
  };

  // Firebase Auth 初始化
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('Auth error:', err);
        setSyncStatus('error');
      }
    };
    initAuth();
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Firestore 数据同步
  useEffect(() => {
    if (!user) return;
    const skusCol = collection(db, 'artifacts', appId, 'public', 'data', 'skus');
    const ordersCol = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
    const shipmentsCol = collection(db, 'artifacts', appId, 'public', 'data', 'shipments');

    const seedIfEmpty = async () => {
      try {
        const snap = await getDocs(skusCol);
        if (snap.empty) await seedDemoData();
      } catch (e) {
        console.error('Seed check error:', e);
      }
    };
    seedIfEmpty();

    const unsubSkus = onSnapshot(skusCol, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (a.category === b.category ? a.sku.localeCompare(b.sku) : a.category === 'FINISHED' ? -1 : 1));
      setSkus(list);
      setSyncStatus('synced');
      setLastUpdatedTime(new Date().toLocaleString('zh-CN', { hour12: false }));
    });

    const unsubOrders = onSnapshot(ordersCol, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.orderNo || '').localeCompare(a.orderNo || ''));
      setOrders(list);
    });

    const unsubShipments = onSnapshot(shipmentsCol, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.shipmentNo || '').localeCompare(a.shipmentNo || ''));
      setShipments(list);
    });

    return () => {
      unsubSkus();
      unsubOrders();
      unsubShipments();
    };
  }, [user]);

  const seedDemoData = async () => {
    if (!user) return;
    try {
      setSyncStatus('connecting');
      const batch = writeBatch(db);
      const existingSkus = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'skus'));
      existingSkus.forEach(d => batch.delete(d.ref));
      const existingOrders = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'orders'));
      existingOrders.forEach(d => batch.delete(d.ref));
      const existingShipments = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'shipments'));
      existingShipments.forEach(d => batch.delete(d.ref));

      INITIAL_SKUS.forEach(item => batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'skus', item.id), item));
      INITIAL_ORDERS.forEach(ord => batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'orders', ord.id), ord));
      INITIAL_SHIPMENTS.forEach(shp => batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'shipments', shp.id), shp));

      await batch.commit();
      setSyncStatus('synced');
      showToast('已重置为 QILATES 提案标准演示数据');
    } catch (err) {
      console.error(err);
      setSyncStatus('error');
      showToast('重置失败', 'error');
    }
  };

  // ==========================================================================
  // 核心业务写操作函数 (联动 Firestore)
  // ==========================================================================
  const handleCreateOrder = async (newOrder) => {
    try {
      const ref = doc(db, 'artifacts', appId, 'public', 'data', 'orders', newOrder.id);
      await setDoc(ref, newOrder);

      // 实时扣减库存与 BOM 辅料
      const targetSku = skus.find(s => s.sku === newOrder.sku);
      if (targetSku) {
        const stockField = newOrder.warehouse === 'OVERSEAS' ? 'overseasStock' : 'domesticStock';
        const currentStock = targetSku[stockField] || 0;
        const newStock = Math.max(0, currentStock - newOrder.qty);

        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'skus', targetSku.id), {
          [stockField]: newStock
        });

        // 级联扣减 BOM 辅料
        if (targetSku.bom && targetSku.bom.length > 0) {
          for (const bomItem of targetSku.bom) {
            const accessory = skus.find(s => s.sku === bomItem.sku);
            if (accessory) {
              const accStock = accessory[stockField] || 0;
              const newAccStock = Math.max(0, accStock - (bomItem.qty * newOrder.qty));
              await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'skus', accessory.id), {
                [stockField]: newAccStock
              });
            }
          }
        }
      }
      showToast(`成功创建订单 ${newOrder.orderNo} 并自动扣减库存与 BOM 辅料`);
    } catch (err) {
      console.error(err);
      showToast('创建订单失败', 'error');
    }
  };

  const handleAdvanceOrderStatus = async (order) => {
    const nextStatusMap = {
      PENDING: { status: 'PUSHED_LX', label: '已推领星 API' },
      PUSHED_LX: { status: 'ACCEPTED', label: '仓库已接单' },
      ACCEPTED: { status: 'SHIPPED', label: '已出库' },
      SHIPPED: { status: 'DELIVERED', label: '已签收' }
    };
    const next = nextStatusMap[order.status];
    if (!next) return;

    openConfirmModal({
      title: `确认推进订单状态？`,
      message: `订单 ${order.orderNo} 将流转至新状态：【${next.label}】`,
      details: [
        { label: '当前客户', value: order.customerName },
        { label: '目标状态', value: next.label }
      ],
      confirmText: '确认流转',
      onConfirm: async () => {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', order.id), {
          status: next.status,
          trackingNo: next.status === 'SHIPPED' ? '1Z' + Math.floor(Math.random() * 89999999 + 10000000) : order.trackingNo
        });
        showToast(`订单 ${order.orderNo} 已成功流转为 ${next.label}`);
      }
    });
  };

  const handlePurchaseInbound = async (skuId, qty, warehouse) => {
    const target = skus.find(s => s.id === skuId);
    if (!target) return;
    const field = warehouse === 'OVERSEAS' ? 'overseasStock' : 'domesticStock';
    const current = target[field] || 0;

    openConfirmModal({
      title: '确认执行采购入库？',
      message: `将为物料【${target.name}】增加库存。`,
      details: [
        { label: '目标仓库', value: warehouse === 'OVERSEAS' ? '美西海外仓' : '国内仓' },
        { label: '增加数量', value: `+${qty} ${target.unit}` }
      ],
      confirmText: '确认入库',
      onConfirm: async () => {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'skus', target.id), {
          [field]: current + Number(qty)
        });
        showToast(`成功入库 ${qty} ${target.unit}`);
      }
    });
  };

  const handleCreateFirstLeg = async (shipmentData) => {
    try {
      const ref = doc(db, 'artifacts', appId, 'public', 'data', 'shipments', shipmentData.id);
      await setDoc(ref, shipmentData);

      // 扣减国内仓，增加在途
      const target = skus.find(s => s.sku === shipmentData.sku);
      if (target) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'skus', target.id), {
          domesticStock: Math.max(0, (target.domesticStock || 0) - shipmentData.qty),
          inTransitStock: (target.inTransitStock || 0) + shipmentData.qty
        });
      }
      showToast(`已成功下发头程备货单 ${shipmentData.shipmentNo} 至领星`);
    } catch (err) {
      console.error(err);
      showToast('下发头程失败', 'error');
    }
  };

  const handleReceiveOverseasShipment = async (shipment) => {
    openConfirmModal({
      title: '确认海外仓签收头程货件？',
      message: `将把头程单 ${shipment.shipmentNo} 的 ${shipment.qty} 件商品转入美西海外仓可用库存。`,
      details: [
        { label: '货件编号', value: shipment.shipmentNo },
        { label: '到货数量', value: `${shipment.qty} 件` }
      ],
      confirmText: '确认签收',
      onConfirm: async () => {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'shipments', shipment.id), {
          status: 'RECEIVED'
        });

        const target = skus.find(s => s.sku === shipment.sku);
        if (target) {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'skus', target.id), {
            inTransitStock: Math.max(0, (target.inTransitStock || 0) - shipment.qty),
            overseasStock: (target.overseasStock || 0) + shipment.qty
          });
        }
        showToast('海外仓已成功签收并更新库存');
      }
    });
  };

  // 财务统计摘要计算
  const financialSummary = useMemo(() => {
    let totalRevenueUsd = 0;
    let totalGoodsCostCny = 0;
    let totalBomCostCny = 0;
    let totalFirstLegCny = 0;
    let totalLastMileUsd = 0;

    orders.forEach(o => {
      if (o.status !== 'PENDING') {
        totalRevenueUsd += (o.revenueUsd || 0);
        totalGoodsCostCny += (o.goodsCostCny || 0);
        totalBomCostCny += (o.bomCostCny || 0);
        totalFirstLegCny += (o.firstLegCny || 0);
        totalLastMileUsd += (o.lastMileUsd || 0);
      }
    });

    const totalRevenueCny = totalRevenueUsd * exchangeRate;
    const totalLastMileCny = totalLastMileUsd * exchangeRate;
    const totalCostCny = totalGoodsCostCny + totalBomCostCny + totalFirstLegCny + totalLastMileCny;
    const grossProfitCny = totalRevenueCny - totalCostCny;
    const grossMargin = totalRevenueCny > 0 ? (grossProfitCny / totalRevenueCny) * 100 : 0;

    return {
      totalRevenueUsd,
      totalRevenueCny,
      totalGoodsCostCny,
      totalBomCostCny,
      totalFirstLegCny,
      totalLastMileCny,
      totalCostCny,
      grossProfitCny,
      grossMargin
    };
  }, [orders, exchangeRate]);

  // ==========================================================================
  // 渲染侧边栏菜单结构
  // ==========================================================================
  const navGroups = [
    {
      key: 'orderGroup',
      title: '订单与渠道履约',
      icon: ShoppingBag,
      items: [
        { id: 'orders', label: '一件代发 / 统一建单', badge: orders.filter(o => o.status === 'PENDING').length || null },
      ]
    },
    {
      key: 'warehouseGroup',
      title: '库存与海外仓双账套',
      icon: Warehouse,
      items: [
        { id: 'inventory', label: 'SKU 双仓库存 & BOM', badge: shipments.filter(s => s.status === 'IN_TRANSIT').length || null },
      ]
    },
    {
      key: 'financeGroup',
      title: '账户 & 双币种账单',
      icon: BarChart3,
      items: [
        { id: 'finance', label: '三段成本 & 月度进销存', badge: null },
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F3EEDF] text-[#5D4B3D] selection:bg-[#67674E] selection:text-[#F3EEDF]" style={{ fontFamily: "'Roboto', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap');
        .font-amiri { font-family: 'Amiri', Georgia, serif; }
        .font-roboto { font-family: 'Roboto', -apple-system, sans-serif; }
      `}</style>

      {/* Toast 提示条 */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border transition-all duration-300 ${
          toast.type === 'error' ? 'bg-[#5D4B3D] text-[#F3EEDF] border-[#5D4B3D]' : 'bg-[#67674E] text-[#F3EEDF] border-[#5D4B3D]/20'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-[#D1E2EA]" /> : <CheckCircle2 className="w-5 h-5 text-[#D1E2EA]" />}
          <span className="text-sm font-medium tracking-wide">{toast.msg}</span>
        </div>
      )}

      {/* 全局统一二次确认弹窗 */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-[#FAF8F2] border border-[#5D4B3D]/20 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#67674E]/10 border border-[#67674E]/20 flex items-center justify-center text-[#67674E]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#5D4B3D] font-amiri">{confirmModal.title}</h3>
                  <p className="text-xs text-[#5D4B3D]/70 mt-0.5">{confirmModal.message}</p>
                </div>
              </div>
              <button 
                onClick={() => !isConfirmExecuting && setConfirmModal(null)}
                className="text-[#5D4B3D]/50 hover:text-[#5D4B3D]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {confirmModal.details && confirmModal.details.length > 0 && (
              <div className="bg-[#F3EEDF] rounded-xl p-3.5 space-y-2 border border-[#5D4B3D]/10">
                {confirmModal.details.map((d, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-[#5D4B3D]/70">{d.label}</span>
                    <span className="font-semibold text-[#5D4B3D] font-mono">{d.value}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isConfirmExecuting}
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#5D4B3D] hover:bg-[#5D4B3D]/10 transition"
              >
                取消 (Esc)
              </button>
              <button
                type="button"
                disabled={isConfirmExecuting}
                onClick={handleConfirmExecute}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#67674E] text-[#F3EEDF] hover:bg-[#53533e] shadow-xs transition flex items-center gap-2"
              >
                {isConfirmExecuting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{confirmModal.confirmText}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 顶部深色品牌导航栏 & 多标签页切换条 */}
      <header className="sticky top-0 z-30 bg-[#5D4B3D] text-[#F3EEDF] shadow-xs">
        <div className="h-12 px-4 flex items-center justify-between gap-4">
          <div className="flex items-center h-full overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2.5 pr-6 shrink-0">
              <div className="w-7 h-7 rounded-md bg-[#67674E] border border-[#F3EEDF]/25 flex items-center justify-center text-[#F3EEDF] font-amiri text-base font-bold">
                Q
              </div>
              <span className="font-amiri text-xl font-bold tracking-wider text-[#F3EEDF]">
                QILATES <span className="font-roboto text-xs font-normal text-[#D1E2EA]">ERP</span>
              </span>
            </div>

            <div className="flex items-end h-full pt-2 gap-1">
              {openTabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <div
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group flex items-center gap-2 px-4 h-9 rounded-t-lg text-xs font-medium cursor-pointer transition-all select-none shrink-0 ${
                      isActive
                        ? 'bg-[#F3EEDF] text-[#5D4B3D] font-bold shadow-2xs'
                        : 'text-[#F3EEDF]/75 hover:text-[#F3EEDF] hover:bg-[#F3EEDF]/10 border-r border-[#F3EEDF]/10'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.closable && (
                      <button
                        type="button"
                        onClick={(e) => closeTab(e, tab.id)}
                        className={`p-0.5 rounded hover:bg-[#5D4B3D]/15 ${
                          isActive ? 'text-[#5D4B3D]/60 hover:text-[#5D4B3D]' : 'text-[#F3EEDF]/50 hover:text-[#F3EEDF]'
                        }`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-xs">
            <button
              onClick={() => navigateToTab('finance', '三段成本 & 月度进销存')}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-[#F3EEDF]/10 text-[#F3EEDF]/90 transition"
            >
              <Calculator className="w-3.5 h-3.5 text-[#D1E2EA]" />
              <span>成本试算</span>
            </button>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3EEDF]/10 text-[11px]">
              <span className={`w-2 h-2 rounded-full ${
                syncStatus === 'synced' ? 'bg-[#D1E2EA] animate-pulse' :
                syncStatus === 'connecting' ? 'bg-amber-400 animate-ping' : 'bg-red-400'
              }`} />
              <span className="hidden sm:inline text-[#F3EEDF]/90">
                {syncStatus === 'synced' ? '云端实时同步' : '同步中'}
              </span>
            </div>

            <button
              onClick={() => openConfirmModal({
                title: '确认重置为提案演示数据？',
                message: '此操作将清空当前云端测试记录，并恢复为 QILATES 提案中的标准成品、辅料及示例订单数据。',
                details: [
                  { label: '影响范围', value: 'SKU 主数据 / 订单流水 / 头程备货单' },
                  { label: '同步方式', value: '全量覆写并实时同步至云端' }
                ],
                confirmText: '确认重置数据',
                onConfirm: seedDemoData
              })}
              title="重置演示数据"
              className="flex items-center gap-1 px-2.5 py-1 rounded hover:bg-[#F3EEDF]/10 text-[#F3EEDF]/85 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">重置数据</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#F3EEDF]/20">
              <div className="w-6 h-6 rounded-full bg-[#D1E2EA] text-[#5D4B3D] flex items-center justify-center font-bold text-[11px]">
                QL
              </div>
              <span className="font-medium tracking-wide text-[#F3EEDF]">QILATES_OPS</span>
            </div>
          </div>
        </div>
      </header>

      {/* 主体双栏工作区 */}
      <div className="flex-1 flex min-h-0">
        {/* 左侧侧边栏 */}
        <aside className={`bg-[#FAF8F2] border-r border-[#5D4B3D]/15 flex flex-col justify-between transition-all duration-200 shrink-0 ${
          sidebarCollapsed ? 'w-16' : 'w-56'
        }`}>
          <div className="p-2.5 space-y-1 overflow-y-auto">
            <button
              onClick={() => navigateToTab('dashboard', '首页工作台')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                activeTab === 'dashboard'
                  ? 'bg-[#D1E2EA]/85 text-[#5D4B3D] font-bold shadow-2xs'
                  : 'text-[#5D4B3D]/80 hover:bg-[#F3EEDF]'
              }`}
            >
              <Home className={`w-4 h-4 shrink-0 ${activeTab === 'dashboard' ? 'text-[#67674E]' : 'text-[#5D4B3D]/60'}`} />
              {!sidebarCollapsed && <span>首页工作台</span>}
            </button>

            <div className="my-2 border-t border-[#5D4B3D]/10" />

            {navGroups.map(group => {
              const GroupIcon = group.icon;
              const isExpanded = expandedGroups[group.key];
              return (
                <div key={group.key} className="space-y-0.5">
                  <button
                    onClick={() => sidebarCollapsed ? navigateToTab(group.items[0].id, group.items[0].label) : setExpandedGroups(p => ({ ...p, [group.key]: !p[group.key] }))}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-[#5D4B3D]/85 hover:bg-[#F3EEDF] transition"
                  >
                    <div className="flex items-center gap-3">
                      <GroupIcon className="w-4 h-4 shrink-0 text-[#67674E]" />
                      {!sidebarCollapsed && <span>{group.title}</span>}
                    </div>
                    {!sidebarCollapsed && (
                      isExpanded ? <ChevronDown className="w-3.5 h-3.5 opacity-50" /> : <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                    )}
                  </button>

                  {!sidebarCollapsed && isExpanded && (
                    <div className="pl-7 pr-1 space-y-0.5">
                      {group.items.map(item => {
                        const isItemActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => navigateToTab(item.id, item.label)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition ${
                              isItemActive
                                ? 'bg-[#67674E] text-[#F3EEDF] font-medium'
                                : 'text-[#5D4B3D]/75 hover:bg-[#F3EEDF] hover:text-[#5D4B3D]'
                            }`}
                          >
                            <span className="truncate">{item.label}</span>
                            {item.badge !== null && (
                              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                                isItemActive ? 'bg-[#F3EEDF] text-[#5D4B3D]' : 'bg-[#D1E2EA] text-[#5D4B3D]'
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-3 border-t border-[#5D4B3D]/10 flex items-center justify-between">
            <button
              onClick={() => setSidebarCollapsed(prev => !prev)}
              className="p-2 rounded-lg text-[#5D4B3D]/70 hover:bg-[#F3EEDF] hover:text-[#5D4B3D] transition flex items-center gap-2 text-xs"
            >
              {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              {!sidebarCollapsed && <span>收起菜单</span>}
            </button>
          </div>
        </aside>

        {/* 右侧主画布工作区 */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="bg-[#FAF8F2]/80 border-b border-[#5D4B3D]/10 px-6 py-2 flex items-center justify-between gap-2 text-xs text-[#5D4B3D]/70">
            <div className="flex items-center gap-2">
              <span className="font-amiri italic text-sm text-[#5D4B3D]">Feel the flow</span>
              <span className="opacity-40">|</span>
              <span>自研 ERP 业务中台 · 领星 WMS 双向 API 协同</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5 text-[#67674E]" />
              <span>更新至时间 {lastUpdatedTime} UTC+8</span>
            </div>
          </div>

          <main className="flex-1 p-5 sm:p-6 lg:p-7 max-w-[1440px] w-full mx-auto overflow-y-auto">
            {activeTab === 'dashboard' && (
              <DashboardHomeModule
                skus={skus}
                orders={orders}
                shipments={shipments}
                summary={financialSummary}
                exchangeRate={exchangeRate}
                onNavigate={navigateToTab}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryModule 
                skus={skus}
                shipments={shipments}
                onPurchaseInbound={handlePurchaseInbound}
                onCreateFirstLeg={handleCreateFirstLeg}
                onReceiveShipment={handleReceiveOverseasShipment}
                openConfirmModal={openConfirmModal}
              />
            )}

            {activeTab === 'orders' && (
              <OrdersModule 
                skus={skus}
                orders={orders}
                onCreateOrder={handleCreateOrder}
                onAdvanceStatus={handleAdvanceOrderStatus}
                openConfirmModal={openConfirmModal}
              />
            )}

            {activeTab === 'finance' && (
              <FinanceModule 
                skus={skus}
                orders={orders}
                summary={financialSummary}
                exchangeRate={exchangeRate}
                setExchangeRate={setExchangeRate}
                monthlyStorageUsd={monthlyStorageUsd}
                setMonthlyStorageUsd={setMonthlyStorageUsd}
                openConfirmModal={openConfirmModal}
                showToast={showToast}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 模块零：首页工作台
// ============================================================================
function DashboardHomeModule({ skus, orders, shipments, summary, exchangeRate, onNavigate }) {
  const pendingOrdersCount = orders.filter(o => o.status === 'PENDING').length;
  const inTransitCount = shipments.filter(s => s.status === 'IN_TRANSIT').length;
  const inTransitUnits = skus.reduce((s, item) => s + (item.inTransitStock || 0), 0);
  const lowStockCount = skus.filter(s => (s.overseasStock || 0) < (s.safetyStock || 100)).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigate('orders', '一件代发 / 统一建单')}
          className="bg-[#FAF8F2] rounded-2xl border border-[#5D4B3D]/15 p-5 hover:border-[#67674E] cursor-pointer transition shadow-2xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5D4B3D]">待处理订单</span>
            <ShoppingBag className="w-4 h-4 text-[#67674E]" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-roboto text-[#67674E]">{pendingOrdersCount}</div>
            <div className="text-[11px] text-[#5D4B3D]/70 mt-1">等待推领星履约</div>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('inventory', 'SKU 双仓库存 & BOM')}
          className="bg-[#FAF8F2] rounded-2xl border border-[#5D4B3D]/15 p-5 hover:border-[#67674E] cursor-pointer transition shadow-2xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5D4B3D]">头程在途货件</span>
            <Truck className="w-4 h-4 text-[#67674E]" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-roboto text-[#5D4B3D]">{inTransitUnits} <span className="text-sm font-normal">件</span></div>
            <div className="text-[11px] text-[#5D4B3D]/70 mt-1">{inTransitCount} 个海运批次在途中</div>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('inventory', 'SKU 双仓库存 & BOM')}
          className="bg-[#FAF8F2] rounded-2xl border border-[#5D4B3D]/15 p-5 hover:border-[#67674E] cursor-pointer transition shadow-2xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5D4B3D]">低库存预警 SKU</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-roboto text-amber-700">{lowStockCount}</div>
            <div className="text-[11px] text-[#5D4B3D]/70 mt-1">低于安全库存水位线</div>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('finance', '三段成本 & 月度进销存')}
          className="bg-[#FAF8F2] rounded-2xl border border-[#5D4B3D]/15 p-5 hover:border-[#67674E] cursor-pointer transition shadow-2xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5D4B3D]">本月毛利润估算</span>
            <DollarSign className="w-4 h-4 text-[#67674E]" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-roboto text-[#67674E]">¥ {summary.grossProfitCny.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}</div>
            <div className="text-[11px] text-[#5D4B3D]/70 mt-1">综合毛利率 {summary.grossMargin.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      <div className="bg-[#FAF8F2] rounded-2xl border border-[#5D4B3D]/15 p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#5D4B3D]">🚀 QILATES 核心业务中台操作指引</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#5D4B3D]/80">
          <div className="p-4 bg-[#F3EEDF] rounded-xl space-y-2 border border-[#5D4B3D]/10">
            <div className="font-bold text-[#5D4B3D]">1. 统一建单与状态机</div>
            <p>小程序、独立站与达人赠送单统一在 ERP 下单，自动扣减主商品及 BOM 辅料（外箱、感谢卡、说明书），并支持一键推领星履约。</p>
          </div>
          <div className="p-4 bg-[#F3EEDF] rounded-xl space-y-2 border border-[#5D4B3D]/10">
            <div className="font-bold text-[#5D4B3D]">2. 双仓库存与头程追踪</div>
            <p>独立核算国内仓与美西海外仓，支持头程备货单下发及海外仓签收确认，避免直接调拨产生的在途账目混乱。</p>
          </div>
          <div className="p-4 bg-[#F3EEDF] rounded-xl space-y-2 border border-[#5D4B3D]/10">
            <div className="font-bold text-[#5D4B3D]">3. 三段成本与双币种台账</div>
            <p>精确归集采购货款（CNY）、BOM 辅料与物流运费，支持汇率调整与月末自动进销存结转。</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 模块一：库存与双仓 BOM 管理模块
// ============================================================================
function InventoryModule({ skus, shipments, onPurchaseInbound, onCreateFirstLeg, onReceiveShipment, openConfirmModal }) {
  const [selectedSku, setSelectedSku] = useState(skus[0]?.sku || '');
  const [inboundQty, setInboundQty] = useState(100);
  const [inboundWh, setInboundWh] = useState('DOMESTIC');

  const [firstLegSku, setFirstLegSku] = useState(skus[0]?.sku || '');
  const [firstLegQty, setFirstLegQty] = useState(200);
  const [firstLegFreight, setFirstLegFreight] = useState(2400);

  const activeSkuObj = skus.find(s => s.sku === selectedSku);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-amiri text-[#5D4B3D]">SKU 双仓库存与 BOM 辅料级联管理</h2>
          <p className="text-xs text-[#5D4B3D]/70 mt-0.5">成品与包材全局编码关联，销售出库自动扣减外箱与感谢卡</p>
        </div>
      </div>

      {/* SKU 列表卡片 */}
      <div className="bg-[#FAF8F2] rounded-2xl border border-[#5D4B3D]/15 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-[#5D4B3D]/10 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5D4B3D]">物料主数据与实时库存</span>
          <span className="text-xs text-[#5D4B3D]/70 font-mono">共 {skus.length} 个 SKU</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F3EEDF] text-[#5D4B3D]/80 border-b border-[#5D4B3D]/10 font-semibold">
              <tr>
                <th className="p-4">SKU 编码 / 品名</th>
                <th className="p-4">类型</th>
                <th className="p-4">采购价 (CNY)</th>
                <th className="p-4">国内仓库存</th>
                <th className="p-4">美西海外仓</th>
                <th className="p-4">头程在途</th>
                <th className="p-4">BOM 关联辅料</th>
                <th className="p-4 text-right">快捷入库</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#5D4B3D]/10">
              {skus.map(item => (
                <tr key={item.id} className="hover:bg-[#F3EEDF]/40 transition">
                  <td className="p-4">
                    <div className="font-bold text-[#5D4B3D] font-mono">{item.sku}</div>
                    <div className="text-[#5D4B3D]/70 text-[11px]">{item.name}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.category === 'FINISHED' ? 'bg-[#67674E] text-[#F3EEDF]' : 'bg-[#D1E2EA] text-[#5D4B3D]'
                    }`}>
                      {item.category === 'FINISHED' ? '成品 SKU' : '辅料包材'}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-medium">¥ {item.purchasePriceCny.toFixed(2)}</td>
                  <td className="p-4 font-mono font-bold text-[#5D4B3D]">{item.domesticStock || 0} {item.unit}</td>
                  <td className="p-4 font-mono font-bold text-[#67674E]">{item.overseasStock || 0} {item.unit}</td>
                  <td className="p-4 font-mono text-[#5D4B3D]/70">{item.inTransitStock || 0} {item.unit}</td>
                  <td className="p-4">
                    {item.bom && item.bom.length > 0 ? (
                      <div className="space-y-0.5 text-[11px]">
                        {item.bom.map((b, i) => (
                          <div key={i} className="text-[#5D4B3D]/80 font-mono">
                            • {b.sku} × {b.qty}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[#5D4B3D]/40 text-[11px]">无关联辅料</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => onPurchaseInbound(item.id, 50, 'DOMESTIC')}
                      className="px-2.5 py-1 bg-[#67674E] text-[#F3EEDF] rounded-lg text-xs font-medium hover:bg-[#53533e] transition"
                    >
                      +50 入库
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 头程备货管理与签收 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#FAF8F2] rounded-2xl border border-[#5D4B3D]/15 p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#5D4B3D] flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#67674E]" />
            <span>下发头程备货单至领星</span>
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[#5D4B3D]/70 mb-1">选择备货 SKU</label>
              <select
                value={firstLegSku}
                onChange={e => setFirstLegSku(e.target.value)}
                className="w-full bg-[#F3EEDF] border border-[#5D4B3D]/20 rounded-xl px-3 py-2 text-[#5D4B3D]"
              >
                {skus.filter(s => s.category === 'FINISHED').map(s => (
                  <option key={s.id} value={s.sku}>{s.sku} - {s.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#5D4B3D]/70 mb-1">备货数量</label>
                <input
                  type="number"
                  value={firstLegQty}
                  onChange={e => setFirstLegQty(Number(e.target.value))}
                  className="w-full bg-[#F3EEDF] border border-[#5D4B3D]/20 rounded-xl px-3 py-2 text-[#5D4B3D] font-mono"
                />
              </div>
              <div>
                <label className="block text-[#5D4B3D]/70 mb-1">头程运费总额 (CNY)</label>
                <input
                  type="number"
                  value={firstLegFreight}
                  onChange={e => setFirstLegFreight(Number(e.target.value))}
                  className="w-full bg-[#F3EEDF] border border-[#5D4B3D]/20 rounded-xl px-3 py-2 text-[#5D4B3D] font-mono"
                />
              </div>
            </div>
            <button
              onClick={() => {
                const shipmentNo = `SHP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 89 + 10)}`;
                onCreateFirstLeg({
                  id: shipmentNo,
                  shipmentNo,
                  sku: firstLegSku,
                  qty: firstLegQty,
                  channel: '美西海运快船 (Matson)',
                  freightCny: firstLegFreight,
                  status: 'IN_TRANSIT',
                  createdAt: new Date().toISOString().slice(0, 10)
                });
              }}
              className="w-full py-2.5 bg-[#67674E] text-[#F3EEDF] rounded-xl font-bold hover:bg-[#53533e] transition"
            >
              确认下发头程备货单
            </button>
          </div>
        </div>

        <div className="bg-[#FAF8F2] rounded-2xl border border-[#5D4B3D]/15 p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#5D4B3D] flex items-center gap-2">
            <Warehouse className="w-4 h-4 text-[#67674E]" />
            <span>在途货件与海外仓签收管理</span>
          </h3>
          <div className="space-y-3 max-h-[240px] overflow-y-auto">
            {shipments.length === 0 ? (
              <div className="text-xs text-[#5D4B3D]/50 text-center py-6">暂无头程在途货件</div>
            ) : (
              shipments.map(s => (
                <div key={s.id} className="bg-[#F3EEDF] p-3.5 rounded-xl border border-[#5D4B3D]/10 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold font-mono text-[#5D4B3D]">{s.shipmentNo}</div>
                    <div className="text-[#5D4B3D]/70 text-[11px]">{s.sku} | 数量: {s.qty} | 运费: ¥{s.freightCny}</div>
                    <div className="text-[10px] text-[#67674E] mt-1 font-semibold">状态: {s.status === 'IN_TRANSIT' ? '🚢 海运在途中' : '✅ 已签收'}</div>
                  </div>
                  {s.status === 'IN_TRANSIT' && (
                    <button
                      onClick={() => onReceiveShipment(s)}
                      className="px-3 py-1.5 bg-[#67674E] text-[#F3EEDF] rounded-lg font-bold hover:bg-[#53533e] transition text-xs"
                    >
                      确认签收
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 模块二：全渠道订单与状态机履约模块
// ============================================================================
function OrdersModule({ skus, orders, onCreateOrder, onAdvanceStatus, openConfirmModal }) {
  const [orderType, setOrderType] = useState('SALES');
  const [channel, setChannel] = useState('独立站 Shopify');
  const [warehouse, setWarehouse] = useState('OVERSEAS');
  const [sku, setSku] = useState(skus[0]?.sku || 'QLT-MAT-001');
  const [qty, setQty] = useState(1);
  const [customerName, setCustomerName] = useState('Sarah Jenkins (US-NY)');
  const [revenueUsd, setRevenueUsd] = useState(49.00);

  const handleSubmitNewOrder = (e) => {
    e.preventDefault();
    const orderId = `SO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 8999 + 1000)}`;
    const targetSku = skus.find(s => s.sku === sku);
    const goodsCost = targetSku ? targetSku.purchasePriceCny * qty : 86 * qty;
    
    // 计算 BOM 辅料成本
    let bomCost = 0;
    if (targetSku && targetSku.bom) {
      targetSku.bom.forEach(b => {
        const acc = skus.find(s => s.sku === b.sku);
        if (acc) bomCost += acc.purchasePriceCny * b.qty * qty;
      });
    }

    const newOrder = {
      id: orderId,
      orderNo: orderId,
      orderType,
      channel,
      warehouse,
      sku,
      qty,
      customerName,
      status: 'PENDING',
      trackingNo: '待推领星履约',
      revenueUsd: orderType === 'SALES' ? Number(revenueUsd) : 0,
      goodsCostCny: goodsCost,
      bomCostCny: bomCost,
      firstLegCny: warehouse === 'OVERSEAS' ? 12 * qty : 0,
      lastMileUsd: warehouse === 'OVERSEAS' ? 5.8 * qty : 1.4 * qty,
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false })
    };

    openConfirmModal({
      title: '确认提交订单并触发库存扣减？',
      message: `将创建订单【${orderId}】并自动联动扣减相应仓库库存与 BOM 辅料。`,
      details: [
        { label: '订单类型', value: orderType === 'SALES' ? '正常销售单' : '达人赠送单' },
        { label: '出库仓库', value: warehouse === 'OVERSEAS' ? '美西海外仓' : '国内仓' },
        { label: '订购 SKU', value: `${sku} × ${qty}` }
      ],
      confirmText: '确认建单并扣库',
      onConfirm: async () => {
        await onCreateOrder(newOrder);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-amiri text-[#5D4B3D]">全渠道统一订单中心与状态机履约</h2>
          <p className="text-xs text-[#5D4B3D]/70 mt-0.5">支持 Shopify、小程序及达人赠送单统一收口，自动化推送领星海外仓</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 新建订单表单 */}
        <div className="bg-[#FAF8F2] rounded-2xl border border-[#5D4B3D]/15 p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#5D4B3D] flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#67674E]" />
            <span>手工录入 / 渠道Webhook建单</span>
          </h3>
          <form onSubmit={handleSubmitNewOrder} className="space-y-3 text-xs">
            <div>
              <label className="block text-[#5D4B3D]/70 mb-1">订单类型</label>
              <select
                value={orderType}
                onChange={e => {
                  setOrderType(e.target.value);
                  if (e.target.value === 'GIFTING') setRevenueUsd(0);
                }}
                className="w-full bg-[#F3EEDF] border border-[#5D4B3D]/20 rounded-xl px-3 py-2 text-[#5D4B3D]"
              >
                <option value="SALES">正常销售单 (Sales)</option>
                <option value="GIFTING">达人赠送单 (Gifting/Seeding)</option>
                <option value="REPLACEMENT">售后补发单 (Replacement)</option>
              </select>
            </div>
            <div>
              <label className="block text-[#5D4B3D]/70 mb-1">销售渠道来源</label>
              <select
                value={channel}
                onChange={e => setChannel(e.target.value)}
                className="w-full bg-[#F3EEDF] border border-[#5D4B3D]/20 rounded-xl px-3 py-2 text-[#5D4B3D]"
              >
                <option value="独立站 Shopify">独立站 Shopify</option>
                <option value="微信小程序">微信小程序</option>
                <option value="TikTok Shop">TikTok Shop</option>
                <option value="达人寄送手工单">达人寄送手工单</option>
              </select>
            </div>
            <div>
              <label className="block text-[#5D4B3D]/70 mb-1">履约仓库归属</label>
              <select
                value={warehouse}
                onChange={e => setWarehouse(e.target.value)}
                className="w-full bg-[#F3EEDF] border border-[#5D4B3D]/20 rounded-xl px-3 py-2 text-[#5D4B3D]"
              >
                <option value="OVERSEAS">美西海外仓 (US West WMS)</option>
                <option value="DOMESTIC">杭州国内仓 (Domestic)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#5D4B3D]/70 mb-1">选择 SKU</label>
                <select
                  value={sku}
                  onChange={e => setSku(e.target.value)}
                  className="w-full bg-[#F3EEDF] border border-[#5D4B3D]/20 rounded-xl px-3 py-2 text-[#5D4B3D]"
                >
                  {skus.filter(s => s.category === 'FINISHED').map(s => (
                    <option key={s.id} value={s.sku}>{s.sku}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[#5D4B3D]/70 mb-1">数量</label>
                <input
                  type="number"
                  value={qty}
                  onChange={e => setQty(Number(e.target.value))}
                  className="w-full bg-[#F3EEDF] border border-[#5D4B3D]/20 rounded-xl px-3 py-2 text-[#5D4B3D] font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-[#5D4B3D]/70 mb-1">客户名称 / 达人Handle</label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full bg-[#F3EEDF] border border-[#5D4B3D]/20 rounded-xl px-3 py-2 text-[#5D4B3D]"
              />
            </div>
            {orderType === 'SALES' && (
              <div>
                <label className="block text-[#5D4B3D]/70 mb-1">订单金额 (USD)</label>
                <input
                  type="number"
                  value={revenueUsd}
                  onChange={e => setRevenueUsd(Number(e.target.value))}
                  className="w-full bg-[#F3EEDF] border border-[#5D4B3D]/20 rounded-xl px-3 py-2 text-[#5D4B3D] font-mono"
                />
              </div>
            )}
            <button
              type="submit"
              className="w-full py-2.5 bg-[#67674E] text-[#F3EEDF] rounded-xl font-bold hover:bg-[#53533e] transition shadow-xs"
            >
              确认建单并扣减库存
            </button>
          </form>
        </div>

        {/* 订单流转列表 */}
        <div className="lg:col-span-2 bg-[#FAF8F2] rounded-2xl border border-[#5D4B3D]/15 overflow-hidden shadow-2xs flex flex-col">
          <div className="px-6 py-4 border-b border-[#5D4B3D]/10 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5D4B3D]">全渠道订单状态机与履约流水</span>
            <span className="text-xs text-[#5D4B3D]/70 font-mono">共 {orders.length} 笔订单</span>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3EEDF] text-[#5D4B3D]/80 border-b border-[#5D4B3D]/10 font-semibold">
                <tr>
                  <th className="p-3.5">单号 / 渠道</th>
                  <th className="p-3.5">类型</th>
                  <th className="p-3.5">客户 / 达人</th>
                  <th className="p-3.5">SKU / 数量</th>
                  <th className="p-3.5">状态机进度</th>
                  <th className="p-3.5 text-right">流转操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#5D4B3D]/10">
                {orders.map(o => {
                  const statusMap = {
                    PENDING: { label: '待发货', color: 'bg-amber-100 text-amber-800' },
                    PUSHED_LX: { label: '已推领星', color: 'bg-blue-100 text-blue-800' },
                    ACCEPTED: { label: '仓库已接单', color: 'bg-purple-100 text-purple-800' },
                    SHIPPED: { label: '已出库', color: 'bg-indigo-100 text-indigo-800' },
                    DELIVERED: { label: '已签收', color: 'bg-emerald-100 text-emerald-800' }
                  };
                  const currentSt = statusMap[o.status] || { label: o.status, color: 'bg-gray-100 text-gray-800' };

                  return (
                    <tr key={o.id} className="hover:bg-[#F3EEDF]/40 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-[#5D4B3D] font-mono">{o.orderNo}</div>
                        <div className="text-[11px] text-[#5D4B3D]/70">{o.channel}</div>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          o.orderType === 'SALES' ? 'bg-[#67674E] text-[#F3EEDF]' : 'bg-[#D1E2EA] text-[#5D4B3D]'
                        }`}>
                          {o.orderType === 'SALES' ? '正常销售' : '达人赠送'}
                        </span>
                      </td>
                      <td className="p-3.5 font-medium">{o.customerName}</td>
                      <td className="p-3.5 font-mono text-[#5D4B3D]">{o.sku} × {o.qty}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${currentSt.color}`}>
                          {currentSt.label}
                        </span>
                        <div className="text-[10px] text-[#5D4B3D]/50 font-mono mt-0.5">运单: {o.trackingNo}</div>
                      </td>
                      <td className="p-3.5 text-right">
                        {o.status !== 'DELIVERED' ? (
                          <button
                            onClick={() => onAdvanceStatus(o)}
                            className="px-2.5 py-1 bg-[#67674E] text-[#F3EEDF] rounded-lg text-xs font-medium hover:bg-[#53533e] transition"
                          >
                            推进状态 →
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-semibold text-[11px]">已完成履约</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 模块三：三段成本与双币种账单模块
// ============================================================================
function FinanceModule({ skus, orders, summary, exchangeRate, setExchangeRate, monthlyStorageUsd, setMonthlyStorageUsd, openConfirmModal, showToast }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-amiri text-[#5D4B3D]">三段成本模型与双币种进销存报表</h2>
          <p className="text-xs text-[#5D4B3D]/70 mt-0.5">精确核算货款 + BOM辅料 + 物流运费，支持人民币与美金多币种切换</p>
        </div>
        <div className="flex items-center gap-3 bg-[#FAF8F2] px-4 py-2 rounded-xl border border-[#5D4B3D]/15 text-xs">
          <span>当前汇率 (1 USD = )</span>
          <input
            type="number"
            step="0.01"
            value={exchangeRate}
            onChange={e => setExchangeRate(Number(e.target.value))}
            className="w-16 bg-[#F3EEDF] border border-[#5D4B3D]/20 rounded px-2 py-1 font-mono text-center font-bold"
          />
          <span>CNY</span>
        </div>
      </div>

      {/* 财务核心指标看板 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FAF8F2] rounded-2xl border border-[#5D4B3D]/15 p-5 shadow-2xs space-y-2">
          <div className="text-xs font-bold text-[#5D4B3D]/70">总营业收入 (Revenue)</div>
          <div className="text-2xl font-bold font-roboto text-[#67674E]">
            $ {summary.totalRevenueUsd.toFixed(2)}
          </div>
          <div className="text-xs font-mono text-[#5D4B3D]/60">折合 ¥ {summary.totalRevenueCny.toFixed(2)}</div>
        </div>

        <div className="bg-[#FAF8F2] rounded-2xl border border-[#5D4B3D]/15 p-5 shadow-2xs space-y-2">
          <div className="text-xs font-bold text-[#5D4B3D]/70">三段总成本 (Total Cost)</div>
          <div className="text-2xl font-bold font-roboto text-[#5D4B3D]">
            ¥ {summary.totalCostCny.toFixed(2)}
          </div>
          <div className="text-[11px] text-[#5D4B3D]/60">含货品、BOM、头程及尾程运费</div>
        </div>

        <div className="bg-[#FAF8F2] rounded-2xl border border-[#5D4B3D]/15 p-5 shadow-2xs space-y-2">
          <div className="text-xs font-bold text-[#5D4B3D]/70">毛利润 (Gross Profit)</div>
          <div className="text-2xl font-bold font-roboto text-[#67674E]">
            ¥ {summary.grossProfitCny.toFixed(2)}
          </div>
          <div className="text-xs font-mono text-emerald-700 font-semibold">综合利润率 {summary.grossMargin.toFixed(1)}%</div>
        </div>

        <div className="bg-[#FAF8F2] rounded-2xl border border-[#5D4B3D]/15 p-5 shadow-2xs space-y-2">
          <div className="text-xs font-bold text-[#5D4B3D]/70">美西仓月度仓储费</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl font-bold font-roboto">$</span>
            <input
              type="number"
              value={monthlyStorageUsd}
              onChange={e => setMonthlyStorageUsd(Number(e.target.value))}
              className="w-24 bg-[#F3EEDF] border border-[#5D4B3D]/20 rounded-lg px-2 py-1 font-mono text-lg font-bold"
            />
          </div>
          <div className="text-[11px] text-[#5D4B3D]/60">按月度账单自动回写分摊</div>
        </div>
      </div>

      {/* 订单级成本三段明细表 */}
      <div className="bg-[#FAF8F2] rounded-2xl border border-[#5D4B3D]/15 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-[#5D4B3D]/10 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5D4B3D]">订单级三段成本归集明细 (COGS + BOM + Logistics)</span>
          <span className="text-xs text-[#5D4B3D]/70 font-mono">多币种实时核算</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F3EEDF] text-[#5D4B3D]/80 border-b border-[#5D4B3D]/10 font-semibold">
              <tr>
                <th className="p-4">订单编号</th>
                <th className="p-4">SKU / 数量</th>
                <th className="p-4">售价 (USD)</th>
                <th className="p-4">货品成本 (CNY)</th>
                <th className="p-4">BOM辅料成本</th>
                <th className="p-4">头程摊销</th>
                <th className="p-4">尾程运费</th>
                <th className="p-4 text-right">单笔毛利估算</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#5D4B3D]/10">
              {orders.map(o => {
                const revCny = (o.revenueUsd || 0) * exchangeRate;
                const costCny = (o.goodsCostCny || 0) + (o.bomCostCny || 0) + (o.firstLegCny || 0) + ((o.lastMileUsd || 0) * exchangeRate);
                const profit = revCny - costCny;

                return (
                  <tr key={o.id} className="hover:bg-[#F3EEDF]/40 transition">
                    <td className="p-4">
                      <div className="font-bold text-[#5D4B3D] font-mono">{o.orderNo}</div>
                      <div className="text-[11px] text-[#5D4B3D]/70">{o.channel}</div>
                    </td>
                    <td className="p-4 font-mono">{o.sku} × {o.qty}</td>
                    <td className="p-4 font-mono font-bold text-[#67674E]">${(o.revenueUsd || 0).toFixed(2)}</td>
                    <td className="p-4 font-mono">¥ {(o.goodsCostCny || 0).toFixed(2)}</td>
                    <td className="p-4 font-mono">¥ {(o.bomCostCny || 0).toFixed(2)}</td>
                    <td className="p-4 font-mono">¥ {(o.firstLegCny || 0).toFixed(2)}</td>
                    <td className="p-4 font-mono">${(o.lastMileUsd || 0).toFixed(2)}</td>
                    <td className="p-4 text-right font-mono font-bold text-[#5D4B3D]">
                      ¥ {profit.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
