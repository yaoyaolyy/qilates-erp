import React, { useState } from 'react';
import { 
  Package, ShoppingCart, DollarSign, BarChart2, Settings, 
  RefreshCw, AlertTriangle, Plus, CheckCircle2, X, ChevronRight, Menu, ShieldCheck 
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modal, setModal] = useState({ show: false, title: '', content: null, onConfirm: null });

  // 状态数据：双账套库存
  const [inventory, setInventory] = useState([
    { sku: 'QLT-MAT-001', name: '指压垫 160×60 (成品)', type: 'finished', domesticStock: 450, overseasStock: 134, inTransit: 200, unitPriceCNY: 86.00, priceUSD: 49.00 },
    { sku: 'Pkg-Box-01', name: '彩色外箱 (辅料)', type: 'accessory', domesticStock: 1200, overseasStock: 1314, inTransit: 500, unitPriceCNY: 3.20, priceUSD: 0 },
    { sku: 'Pkg-Card-02', name: '品牌感谢卡 / 说明书 (辅料)', type: 'accessory', domesticStock: 3000, overseasStock: 2500, inTransit: 1000, unitPriceCNY: 0.50, priceUSD: 0 }
  ]);

  // 订单列表
  const [orders, setOrders] = useState([
    { id: 'SO-20261118-001', type: '销售出库', channel: 'Shopify 独立站', sku: 'QLT-MAT-001', qty: 1, status: '已签收/完成', tracking: 'TRK99823101', amountUSD: 49.00 },
    { id: 'SO-20261118-002', type: '达人赠送', channel: 'TikTok 运营部', sku: 'QLT-MAT-001', qty: 1, status: '已推领星/仓库已接单', tracking: 'TRK99823102', amountUSD: 0 }
  ]);

  // 弹窗触发器
  const triggerConfirm = (title, contentNode, onConfirmAction) => {
    setModal({
      show: true,
      title: title || '操作二次确认',
      content: contentNode,
      onConfirm: () => {
        onConfirmAction();
        setModal({ show: false, title: '', content: null, onConfirm: null });
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F3EEDF] text-[#5D4B3D] flex flex-col font-sans">
      {/* 品牌深色顶栏 */}
      <header className="bg-[#5D4B3D] text-[#F3EEDF] h-14 px-4 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-[#67674E] rounded transition">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-serif text-lg tracking-wider font-bold">QILATES · 气拉提 ERP 业务中台</span>
          <span className="text-xs bg-[#67674E] px-2 py-0.5 rounded text-[#D1E2EA]">Cloud Code 独立自研版 v0.1</span>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <span className="flex items-center text-xs bg-[#D1E2EA] text-[#5D4B3D] px-2.5 py-1 rounded-full font-medium">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> 领星 API 双向连通正常
          </span>
          <span className="font-medium">杭州运营中心</span>
        </div>
      </header>

      {/* 主体布局 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧导航 */}
        {sidebarOpen && (
          <aside className="w-64 bg-[#F3EEDF] border-r border-[#5D4B3D]/10 flex flex-col py-4 px-3 space-y-1">
            <div className="text-xs font-bold text-[#5D4B3D]/60 px-3 mb-2 uppercase tracking-wider">业务功能菜单</div>
            {[
              { id: 'home', label: '首页总览工作台', icon: BarChart2 },
              { id: 'inventory', label: '库存与 BOM 双账套', icon: Package },
              { id: 'orders', label: '统一订单与履约状态机', icon: ShoppingCart },
              { id: 'finance', label: '双币种成本与月度台账', icon: DollarSign },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive ? 'bg-[#67674E] text-white shadow-sm' : 'hover:bg-[#67674E]/10 text-[#5D4B3D]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </aside>
        )}

        {/* 右侧主工作区 */}
        <main className="flex-1 overflow-y-auto p-6">
          {currentTab === 'home' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-serif font-bold text-[#5D4B3D]">运营总览控制台</h1>
                <span className="text-xs text-[#5D4B3D]/70 bg-white/60 px-3 py-1 rounded border border-[#5D4B3D]/10">更新至 2026-11 实时云端同步</span>
              </div>
              {/* 核心指标卡片 */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-[#5D4B3D]/10 shadow-sm">
                  <div className="text-xs text-[#5D4B3D]/60">待处理/待发货订单</div>
                  <div className="text-3xl font-serif font-bold mt-2 text-[#67674E]">3</div>
                  <div className="text-xs text-green-600 mt-1">↑ 实时同步领星 OMS</div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-[#5D4B3D]/10 shadow-sm">
                  <div className="text-xs text-[#5D4B3D]/60">美西海外仓可用成品</div>
                  <div className="text-3xl font-serif font-bold mt-2 text-[#5D4B3D]">134 垫</div>
                  <div className="text-xs text-[#5D4B3D]/70 mt-1">安全库存阈值以上</div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-[#5D4B3D]/10 shadow-sm">
                  <div className="text-xs text-[#5D4B3D]/60">本月达人寄送赠品</div>
                  <div className="text-3xl font-serif font-bold mt-2 text-[#67674E]">42 套</div>
                  <div className="text-xs text-blue-600 mt-1">独立台账不计收入</div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-[#5D4B3D]/10 shadow-sm">
                  <div className="text-xs text-[#5D4B3D]/60">本月双币种折合销售额</div>
                  <div className="text-3xl font-serif font-bold mt-2 text-[#5D4B3D]">$9,114</div>
                  <div className="text-xs text-[#5D4B3D]/70 mt-1">Stripe & 独立站收款</div>
                </div>
              </div>

              {/* 快捷操作区 */}
              <div className="bg-white p-6 rounded-xl border border-[#5D4B3D]/10 shadow-sm">
                <h3 className="text-lg font-serif font-bold mb-4">快捷业务处理</h3>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setCurrentTab('orders')}
                    className="bg-[#67674E] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#67674E]/90 transition"
                  >
                    前往创建订单 / 达人赠送单
                  </button>
                  <button 
                    onClick={() => setCurrentTab('inventory')}
                    className="bg-[#D1E2EA] text-[#5D4B3D] px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#D1E2EA]/80 transition"
                  >
                    查看国内/海外双账套及辅料 BOM
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'inventory' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-serif font-bold">库存与 BOM 辅料双账套</h1>
              <div className="bg-white rounded-xl border border-[#5D4B3D]/10 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#F3EEDF] border-b border-[#5D4B3D]/10 text-[#5D4B3D]">
                      <th className="p-4">SKU 编码</th>
                      <th className="p-4">品名与规格</th>
                      <th className="p-4">属性分类</th>
                      <th className="p-4">国内仓库存</th>
                      <th className="p-4">美西海外仓</th>
                      <th className="p-4">头程在途</th>
                      <th className="p-4">单位成本 (CNY)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item, idx) => (
                      <tr key={idx} className="border-b border-[#5D4B3D]/5 hover:bg-[#F3EEDF]/40">
                        <td className="p-4 font-mono font-medium">{item.sku}</td>
                        <td className="p-4 font-medium">{item.name}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-xs ${item.type === 'finished' ? 'bg-[#67674E] text-white' : 'bg-[#D1E2EA] text-[#5D4B3D]'}`}>
                            {item.type === 'finished' ? '成品 SKU' : '包装辅料 SKU'}
                          </span>
                        </td>
                        <td className="p-4">{item.domesticStock}</td>
                        <td className="p-4 font-bold text-[#67674E]">{item.overseasStock}</td>
                        <td className="p-4 text-blue-600">{item.inTransit}</td>
                        <td className="p-4">¥ {item.unitPriceCNY.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentTab === 'orders' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-serif font-bold">统一订单中心与状态机</h1>
              <div className="bg-white p-6 rounded-xl border border-[#5D4B3D]/10 shadow-sm flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-base">快捷新建订单 / 达人寄送单</h3>
                  <p className="text-xs text-[#5D4B3D]/70 mt-1">支持自动绑定 BOM 辅料随成品扣减，同步推给领星履约</p>
                </div>
                <button 
                  onClick={() => triggerConfirm(
                    "确认创建新订单", 
                    <div>创建后将自动扣减美西海外仓 1 个指压垫，并同步扣减 1 个外箱与 1 张说明书辅料。</div>,
                    () => {
                      setOrders([
                        ...orders,
                        { id: `SO-20261118-00${orders.length + 1}`, type: '达人赠送', channel: '小红书达人对接', sku: 'QLT-MAT-001', qty: 1, status: '待推领星履约', tracking: '待生成', amountUSD: 0 }
                      ]);
                    }
                  )}
                  className="bg-[#67674E] text-white px-4 py-2 rounded-lg text-sm flex items-center shadow hover:bg-[#67674E]/90 transition"
                >
                  <Plus className="w-4 h-4 mr-1.5" /> 模拟新建达人赠送单
                </button>
              </div>

              <div className="bg-white rounded-xl border border-[#5D4B3D]/10 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#F3EEDF] border-b border-[#5D4B3D]/10 text-[#5D4B3D]">
                      <th className="p-4">内部单号</th>
                      <th className="p-4">出库类型</th>
                      <th className="p-4">渠道来源</th>
                      <th className="p-4">SKU / 数量</th>
                      <th className="p-4">状态机履约进度</th>
                      <th className="p-4">追踪号 / 运单</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o, i) => (
                      <tr key={i} className="border-b border-[#5D4B3D]/5 hover:bg-[#F3EEDF]/40">
                        <td className="p-4 font-mono font-medium">{o.id}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-xs ${o.type === '销售出库' ? 'bg-[#67674E] text-white' : 'bg-[#D1E2EA] text-[#5D4B3D]'}`}>
                            {o.type}
                          </span>
                        </td>
                        <td className="p-4">{o.channel}</td>
                        <td className="p-4">{o.sku} × {o.qty}</td>
                        <td className="p-4 text-xs font-medium text-[#67674E]">{o.status}</td>
                        <td className="p-4 font-mono text-xs">{o.tracking}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentTab === 'finance' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-serif font-bold">双币种成本与月度报表</h1>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-[#5D4B3D]/10 shadow-sm">
                  <div className="text-xs text-[#5D4B3D]/60">美元独立站总收入 (USD)</div>
                  <div className="text-2xl font-serif font-bold mt-2 text-[#67674E]">$ 9,114.00</div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-[#5D4B3D]/10 shadow-sm">
                  <div className="text-xs text-[#5D4B3D]/60">人民币工厂货款+辅料支出 (CNY)</div>
                  <div className="text-2xl font-serif font-bold mt-2 text-[#5D4B3D]">¥ 19,608.00</div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-[#5D4B3D]/10 shadow-sm">
                  <div className="text-xs text-[#5D4B3D]/60">海外尾程与仓储总计 (USD)</div>
                  <div className="text-2xl font-serif font-bold mt-2 text-blue-600">$ 1,420.00</div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 全局二次确认弹窗 */}
      {modal.show && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-[#5D4B3D]/20 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#5D4B3D] text-[#F3EEDF] px-6 py-4 flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg">{modal.title}</h3>
              <button onClick={() => setModal({ show: false, title: '', content: null, onConfirm: null })} className="hover:bg-white/10 p-1 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm text-[#5D4B3D]">
              {modal.content}
            </div>
            <div className="bg-[#F3EEDF]/60 px-6 py-4 flex justify-end space-x-3 border-t border-[#5D4B3D]/10">
              <button 
                onClick={() => setModal({ show: false, title: '', content: null, onConfirm: null })}
                className="px-4 py-2 rounded-lg text-sm border border-[#5D4B3D]/20 hover:bg-white transition"
              >
                取消
              </button>
              <button 
                onClick={modal.onConfirm}
                className="px-5 py-2 rounded-lg text-sm bg-[#67674E] text-white font-medium hover:bg-[#67674E]/90 transition shadow-sm"
              >
                确认无误，执行提交
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
