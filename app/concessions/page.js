'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CONCESSION_CATEGORIES, CONCESSION_ITEMS, MODIFIER_GROUPS, COMBO_INCLUDES, calculateItemTotal } from '@/lib/concession-config';

const TAX_RATE = 0.0925;
function fmt(a) { return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(a); }

export default function ConcessionsPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [ticketInfo, setTicketInfo] = useState(null);
  const [activeCategory, setActiveCategory] = useState('hot-dogs');
  const [expandedItem, setExpandedItem] = useState(null);
  const [isFromTickets, setIsFromTickets] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('lh_ticket_selection');
      if (raw) { setTicketInfo(JSON.parse(raw)); setIsFromTickets(true); }
    } catch {}
  }, []);

  const getCartItem = useCallback((itemId, isCombo) => cart.find(c => c.itemId === itemId && c.isCombo === isCombo), [cart]);

  const updateCart = useCallback((itemId, isCombo, quantity, modifiers = [], sauceChoice = '') => {
    setCart(prev => {
      const idx = prev.findIndex(c => c.itemId === itemId && c.isCombo === isCombo);
      if (quantity <= 0) return prev.filter((_, i) => i !== idx);
      if (idx >= 0) { const u = [...prev]; u[idx] = { ...u[idx], quantity, modifiers, sauceChoice }; return u; }
      return [...prev, { itemId, quantity, isCombo, modifiers, sauceChoice }];
    });
  }, []);

  const totals = cart.reduce((a, ci) => {
    const item = CONCESSION_ITEMS.find(i => i.id === ci.itemId);
    if (!item) return a;
    return { count: a.count + ci.quantity, sub: a.sub + calculateItemTotal(item, ci.quantity, ci.isCombo, ci.modifiers) };
  }, { count: 0, sub: 0 });
  const tax = Math.round(totals.sub * TAX_RATE * 100) / 100;
  const total = Math.round((totals.sub + tax) * 100) / 100;

  function handleCheckout() {
    const order = cart.map(ci => {
      const item = CONCESSION_ITEMS.find(i => i.id === ci.itemId);
      return { ...ci, name: item?.name, unitPrice: ci.isCombo ? item?.comboPrice : item?.price, lineTotal: calculateItemTotal(item, ci.quantity, ci.isCombo, ci.modifiers) };
    });
    sessionStorage.setItem('lh_concessions', JSON.stringify(order));
    router.push('/checkout');
  }

  function skipConcessions() { sessionStorage.removeItem('lh_concessions'); router.push('/checkout'); }

  const items = CONCESSION_ITEMS.filter(i => i.category === activeCategory);

  return (
    <main style={{ background:'#0a0a0a', color:'#f5e9c8', minHeight:'100vh', fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" }}>
      <div style={{ background:'radial-gradient(ellipse at top,rgba(212,175,55,0.15),transparent 60%)', borderBottom:'1px solid rgba(212,175,55,0.2)', padding:'40px 20px 30px' }}>
        <div style={{ maxWidth:960, margin:'0 auto', textAlign:'center' }}>
          <a href="/" style={{ color:'#d4af37', textDecoration:'none', fontSize:'0.9rem' }}>← Back</a>
          <h1 style={{ fontSize:'2rem', fontWeight:800, marginBottom:8 }}><span style={{color:'#d4af37'}}>\ud83c\udf7f</span> Add Food & Drinks</h1>
          <p style={{ color:'rgba(245,233,200,0.7)', maxWidth:500, margin:'0 auto' }}>
            {isFromTickets ? 'Upgrade your movie experience! Ready at the counter.' : 'Order ahead — skip the line.'}
          </p>
        </div>
      </div>

      <div style={{ background:'#111', borderBottom:'1px solid #222', padding:'0 16px', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ display:'flex', gap:6, overflowX:'auto', padding:'12px 0', maxWidth:960, margin:'0 auto', scrollbarWidth:'none' }}>
          {CONCESSION_CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
              display:'flex', alignItems:'center', gap:6, padding:'10px 18px', borderRadius:999,
              border: activeCategory===cat.id ? '1px solid #d4af37' : '1px solid #333',
              background: activeCategory===cat.id ? '#d4af37' : 'transparent',
              color: activeCategory===cat.id ? '#0a0a0a' : '#999',
              fontSize:'0.85rem', fontWeight:600, cursor:'pointer', whiteSpace:'nowrap',
            }}><span style={{fontSize:'1.3rem'}}>{cat.icon}</span><span>{cat.name}</span></button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:960, margin:'0 auto', padding:'24px 16px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
          {items.map(item => <ItemCard key={item.id} item={item} cartItem={getCartItem(item.id,false)} cartCombo={getCartItem(item.id,true)} onUpdate={updateCart} expanded={expandedItem===item.id} onToggle={() => setExpandedItem(expandedItem===item.id?null:item.id)} />)}
        </div>
        <div style={{ textAlign:'center', padding:20, margin:'24px 0', background:'linear-gradient(135deg,rgba(212,175,55,0.1),rgba(212,175,55,0.05))', border:'1px solid rgba(212,175,55,0.2)', borderRadius:12 }}>
          <strong style={{color:'#d4af37'}}>COMBO = Fountain Drink + Popcorn</strong>
          <p style={{color:'rgba(255,255,255,0.7)',fontSize:'0.85rem',marginTop:4}}>Upgrade any item to a combo and save!</p>
        </div>
      </div>

      {totals.count > 0 && (
        <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'rgba(10,10,10,0.95)', backdropFilter:'blur(20px)', borderTop:'2px solid #d4af37', padding:'14px 20px', zIndex:100 }}>
          <div style={{ maxWidth:960, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:36,height:36,borderRadius:'50%',background:'#d4af37',color:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800}}>{totals.count}</div>
              <div><div style={{fontWeight:700}}>Your Order</div><div style={{fontSize:'0.8rem',color:'rgba(255,255,255,0.7)'}}>Subtotal: {fmt(totals.sub)} + tax</div></div>
            </div>
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              <span style={{fontSize:'1.25rem',fontWeight:800,color:'#d4af37'}}>{fmt(total)}</span>
              <button onClick={handleCheckout} style={{padding:'12px 28px',background:'#d4af37',color:'#0a0a0a',border:'none',borderRadius:999,fontSize:'1rem',fontWeight:800,cursor:'pointer'}}>Checkout →</button>
            </div>
          </div>
        </div>
      )}

      <div style={{textAlign:'center',padding:20}}>
        {isFromTickets ? <button onClick={skipConcessions} style={{background:'none',border:'1px solid #333',color:'rgba(245,233,200,0.5)',padding:'12px 24px',borderRadius:999,fontSize:'0.9rem',cursor:'pointer'}}>No thanks, just the tickets →</button>
        : <a href="/" style={{color:'rgba(245,233,200,0.5)',padding:'12px 24px',border:'1px solid #333',borderRadius:999,textDecoration:'none',display:'inline-block'}}>← Back to Movies</a>}
      </div>
      <div style={{height: totals.count > 0 ? 120 : 40}} />
    </main>
  );
}

function ItemCard({ item, cartItem, cartCombo, onUpdate, expanded, onToggle }) {
  const [isCombo, setIsCombo] = useState(false);
  const [mods, setMods] = useState([]);
  const [sauce, setSauce] = useState('');
  const active = isCombo ? cartCombo : cartItem;
  const qty = active?.quantity || 0;
  const price = isCombo ? item.comboPrice : item.price;
  const hasMods = item.modifierGroups?.length > 0;

  let modTotal = 0;
  for (const mod of mods) {
    for (const gId of item.modifierGroups) {
      const g = MODIFIER_GROUPS[gId];
      if (g) { const o = g.options.find(x => x.id === mod); if (o) modTotal += o.price; }
    }
  }

  function inc() { onUpdate(item.id, isCombo, qty+1, mods, sauce); }
  function dec() { if (qty > 0) onUpdate(item.id, isCombo, qty-1, mods, sauce); }
  function toggleMod(id) { const n = mods.includes(id) ? mods.filter(m=>m!==id) : [...mods,id]; setMods(n); if(qty>0) onUpdate(item.id,isCombo,qty,n,sauce); }
  function pickSauce(id) { setSauce(id); if(qty>0) onUpdate(item.id,isCombo,qty,mods,id); }

  return (
    <div style={{ background:'#141414', border: qty>0 ? '1px solid #d4af37' : '1px solid #2a2a2a', borderRadius:16, overflow:'hidden', boxShadow: qty>0 ? '0 0 20px rgba(212,175,55,0.15)' : 'none' }}>
      <div style={{ position:'relative', height:180, overflow:'hidden' }}>
        <div style={{ width:'100%', height:'100%', backgroundSize:'cover', backgroundPosition:'center', backgroundColor:'#1a1a1a', backgroundImage:'url('+item.image+')' }}>
          <div style={{position:'absolute',bottom:0,left:0,right:0,height:'40%',background:'linear-gradient(transparent,rgba(20,20,20,0.9))'}} />
        </div>
        {item.badge && <div style={{position:'absolute',top:10,left:10,background:'rgba(212,175,55,0.95)',color:'#0a0a0a',padding:'4px 10px',borderRadius:6,fontSize:'0.7rem',fontWeight:800,textTransform:'uppercase'}}>{item.badge==='Best Seller'?'\ud83d\udd25':'\u2b50'} {item.badge}</div>}
        {item.comboPrice && <div style={{position:'absolute',top:10,right:10,background:'rgba(200,30,30,0.95)',color:'#fff',padding:'4px 10px',borderRadius:6,fontSize:'0.7rem',fontWeight:800}}>COMBO {fmt(item.comboPrice)}</div>}
      </div>
      <div style={{padding:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div><h3 style={{fontSize:'1.05rem',fontWeight:700,margin:'0 0 4px'}}>{item.name}</h3><p style={{fontSize:'0.8rem',color:'rgba(245,233,200,0.5)',margin:0}}>{item.description}</p></div>
          <div style={{fontSize:'1.15rem',fontWeight:800,color:'#d4af37',whiteSpace:'nowrap',marginLeft:12}}>{fmt(price)}</div>
        </div>
        {item.comboPrice && <button onClick={()=>setIsCombo(!isCombo)} style={{width:'100%',textAlign:'left',padding:'10px 14px',marginTop:12,background:isCombo?'rgba(212,175,55,0.15)':'rgba(212,175,55,0.08)',border:isCombo?'1px solid #d4af37':'1px dashed rgba(212,175,55,0.3)',borderRadius:10,color:'#d4af37',fontSize:'0.85rem',fontWeight:600,cursor:'pointer'}}>
          {isCombo?'\u2713 ':'+ '}Make it a Combo — {fmt(item.comboPrice)}<br/><span style={{fontSize:'0.7rem',opacity:0.8}}>{COMBO_INCLUDES}</span>
        </button>}
        {hasMods && <div>
          <button onClick={onToggle} style={{background:'none',border:'none',color:'rgba(245,233,200,0.6)',fontSize:'0.8rem',cursor:'pointer',padding:'8px 0 0',fontWeight:600}}>
            {expanded?'\u25be':'\u25b8'} Customize{modTotal>0&&<span style={{color:'#d4af37'}}> (+{fmt(modTotal)})</span>}
          </button>
          {expanded && <div style={{paddingTop:10}}>
            {item.modifierGroups.map(gId => {
              const g = MODIFIER_GROUPS[gId]; if(!g) return null;
              return <div key={gId} style={{marginBottom:8}}>
                <div style={{fontSize:'0.75rem',color:'#d4af37',marginBottom:6,letterSpacing:1,textTransform:'uppercase'}}>{g.name}</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {g.options.map(opt => {
                    const sel = g.type==='single' ? sauce===opt.id : mods.includes(opt.id);
                    return <button key={opt.id} onClick={()=>g.type==='single'?pickSauce(opt.id):toggleMod(opt.id)} style={{
                      padding:'6px 12px',borderRadius:20,border:sel?'1px solid #d4af37':'1px solid #333',
                      background:sel?'rgba(212,175,55,0.15)':'transparent',color:sel?'#d4af37':'#ccc',fontSize:'0.78rem',cursor:'pointer'
                    }}>{sel?'\u2713 ':''}{opt.name}{opt.price>0&&' +$'+opt.price}</button>;
                  })}
                </div>
              </div>;
            })}
          </div>}
        </div>}
        <div style={{marginTop:14}}>
          {qty===0 ? <button onClick={inc} style={{width:'100%',padding:12,background:'#d4af37',color:'#0a0a0a',border:'none',borderRadius:10,fontSize:'0.95rem',fontWeight:700,cursor:'pointer'}}>+ Add to Order</button>
          : <div style={{display:'flex',alignItems:'center',background:'#1a1a1a',borderRadius:10,overflow:'hidden',border:'1px solid #d4af37'}}>
              <button onClick={dec} style={{width:44,height:44,background:'rgba(212,175,55,0.1)',border:'none',color:'#d4af37',fontSize:'1.3rem',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>\u2212</button>
              <span style={{flex:1,textAlign:'center',fontSize:'1.1rem',fontWeight:700}}>{qty}</span>
              <button onClick={inc} style={{width:44,height:44,background:'rgba(212,175,55,0.1)',border:'none',color:'#d4af37',fontSize:'1.3rem',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
              <span style={{padding:'0 14px',fontSize:'0.95rem',fontWeight:700,color:'#d4af37'}}>{fmt((price+modTotal)*qty)}</span>
            </div>}
        </div>
      </div>
    </div>
  );
}
