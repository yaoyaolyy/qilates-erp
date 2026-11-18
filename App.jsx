import React, { useState } from 'react';

export default function App() {
  const [tab, setTab] = useState('home');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F3EEDF', color: '#5D4B3D', padding: '24px', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: '#5D4B3D', color: '#F3EEDF', padding: '20px 24px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '22px' }}>QILATES · 气拉提 ERP 业务中台</h1>
        <span style={{ fontSize: '12px', backgroundColor: '#67674E', padding: '4px 12px', borderRadius: '20px', color: '#D1E2EA' }}>在线运行正常</span>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {['home', 'inventory', 'orders'].map((t) => (
          <button 
            key={t}
            onClick={() => setTab(t)}
            style={{ 
              padding: '10px 20px', 
              borderRadius: '8px', 
              border: 'none', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              backgroundColor: tab === t ? '#67674E' : '#FFFFFF',
              color: tab === t ? '#FFFFFF' : '#5D4B3D',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            {t === 'home' ? '🏠 总览看板' : t === 'inventory' ? '📦 国内/海外双账套' : '🛒 统一订单与状态机'}
          </button>
        ))}
      </div>

      {tab === 'home' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '14px', opacity: 0.7 }}>待处理订单</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', marginTop: '8px', color: '#67674E' }}>3</div>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '14px', opacity: 0.7 }}>美西海外仓可用成品</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', marginTop: '8px', color: '#5D4B3D' }}>134 垫</div>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '14px', opacity: 0.7 }}>本月达人赠送单</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', marginTop: '8px', color: '#67674E' }}>42 套</div>
          </div>
        </div>
      )}

      {tab === 'inventory' && (
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h2 style={{ marginTop: 0 }}>库存与 BOM 辅料管理</h2>
          <p style={{ opacity: 0.8 }}>成品 SKU（指压垫 QLT-MAT-001）自动绑定包装外箱与感谢卡辅料，销售出库时联动扣减。</p>
        </div>
      )}

      {tab === 'orders' && (
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h2 style={{ marginTop: 0 }}>统一订单中心</h2>
          <p style={{ opacity: 0.8 }}>支持 Shopify、小程序与达人赠送单统一收口，自动状态机流转与领星履约推送。</p>
        </div>
      )}
    </div>
  );
}
