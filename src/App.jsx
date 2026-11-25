import { useEffect, useMemo, useState } from 'react'
import { CATEGORIES, DISTRICTS, OWNER_WHATSAPP, catById } from './data.js'
import { supabase } from './supabase.js'

const PHONE_RE = /^01[0-9]{9}$/

function waLink(text) {
  return `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(text)}`
}

function isDupError(err) {
  return err && String(err.message || '').includes('duplicate_submission')
}

function Header({ onNav }) {
  return (
    <header className="header">
      <div className="brand" onClick={() => onNav('home')}>
        <img className="brand-logo" src="/icon.svg" alt="شعار خدمات قنا" />
        <span className="brand-name"><em>خدمات</em> <strong>قنا</strong></span>
      </div>
      <nav className="topnav">
        <button onClick={() => onNav('home')}>الرئيسية</button>
        <button onClick={() => onNav('categories')}>الأقسام</button>
        <button onClick={() => onNav('join')}>سجّل كفني</button>
        <button className="cta" onClick={() => onNav('request')}>اطلب خدمة</button>
      </nav>
    </header>
  )
}

function Hero({ query, setQuery, onSearch, onCat, providerCount }) {
  return (
    <section className="hero">
      <div className="hero-glow" />
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <div className="orb orb-c" />
      <span className="hero-badge">📍 من قنا.. لقنا</span>
      <h1>محتاج سباك.. كهربائي.. مدرّس؟<br /><span className="grad-text">كل خدمات قنا في مكان واحد</span></h1>
      <p className="hero-sub">منصة بتجمع أهل قنا بأمهر الفنيين في المحافظة — الفني بنفسه بيسجل، وإحنا بنراجع قبل الظهور.</p>
      <div className="search-box">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          placeholder="دوّر على خدمة أو فني… مثلاً: سباك في سمهود"
        />
        <button onClick={onSearch}>🔎 بحث</button>
      </div>
      <div className="chips">
        {CATEGORIES.slice(0, 5).map((c) => (
          <button key={c.id} className="chip" onClick={() => onCat(c.id)}>{c.icon} {c.name}</button>
        ))}
      </div>
      <div className="stats">
        <div className="stat"><span className="stat-icon">🧰</span><b>{CATEGORIES.length}</b><span>قسم خدمات</span></div>
        <div className="stat"><span className="stat-icon">🗺️</span><b>{DISTRICTS.length}</b><span>مراكز مغطاة</span></div>
        <div className="stat"><span className="stat-icon">🙋</span><b>{providerCount}</b><span>فني مسجّل</span></div>
      </div>
    </section>
  )
}

function Categories({ onCat, providers }) {
  return (
    <section className="section" id="categories">
      <span className="overline">الأقسام</span>
      <h2>اختار الخدمة اللي محتاجها</h2>
      <p className="section-sub">كل قسم هيظهر فيه الفنيين المعتمدين أول ما يسجلوا.</p>
      <div className="cat-grid">
        {CATEGORIES.map((c) => {
          const n = providers.filter((p) => p.category === c.id).length
          return (
            <button key={c.id} className="cat-card" onClick={() => onCat(c.id)}>
              <span className="cat-icon">{c.icon}</span>
              <b>{c.name}</b>
              <small>{c.desc}</small>
              <span className="cat-count">{n > 0 ? `${n} فني` : 'لسه'}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function EmptyProviders({ onJoin, compact }) {
  return (
    <div className={compact ? 'empty-state compact' : 'empty-state'}>
      <span className="empty-icon">🛠️</span>
      <b>لسه مفيش فنيين هنا</b>
      <p>المنصة لسه في أولها والفنيين بتسجل دلوقتي. لو انت فني، كن من الأوائل وسجّل بياناتك — التسجيل مجاني.</p>
      {onJoin && <button className="btn-yellow" onClick={onJoin}>سجّل كفني <span className="btn-arrow">←</span></button>}
    </div>
  )
}

function ProviderCard({ p, onOpen, onRequest }) {
  const cat = catById(p.category)
  const isNew = Date.now() - new Date(p.created_at).getTime() < 14 * 864e5
  return (
    <div className="p-card" onClick={() => onOpen(p)}>
      <div className="p-top">
        <div className="avatar-ring"><div className="avatar">{p.name.trim().slice(0, 1)}</div></div>
        <div className="p-head">
          <b className="p-name">{p.name} {isNew && <span className="badge-new">جديد</span>}</b>
          <small>{cat.icon} {cat.name} · 📍 {p.district}</small>
        </div>
      </div>
      {p.bio && <p className="p-bio">{p.bio}</p>}
      <div className="p-meta">
        {p.years != null && <span>⏳ خبرة {p.years} سنة</span>}
        <span>📍 {p.district}</span>
      </div>
      <div className="p-bottom">
        <span className="muted-sm">معتمد من إدارة المنصة</span>
        <button className="btn-primary" onClick={(e) => { e.stopPropagation(); onRequest(p) }}>اطلبه <span className="btn-arrow">←</span></button>
      </div>
    </div>
  )
}

function SkeletonCards() {
  return (
    <div className="p-grid">
      {[0, 1, 2].map((i) => (
        <div key={i} className="p-card skel-card">
          <div className="skel skel-row" />
          <div className="skel skel-line" />
          <div className="skel skel-line short" />
        </div>
      ))}
    </div>
  )
}

function Featured({ providers, loading, onOpen, onRequest, onJoin, onAll }) {
  if (loading) {
    return (
      <section className="section">
        <span className="overline">الفنيين</span>
        <h2>الفنيون المسجّلون</h2>
        <SkeletonCards />
      </section>
    )
  }
  if (providers.length === 0) {
    return (
      <section className="section">
        <span className="overline">الفنيين</span>
        <h2>الفنيون المسجّلون</h2>
        <EmptyProviders onJoin={onJoin} />
      </section>
    )
  }
  return (
    <section className="section">
      <div className="section-head">
        <div>
          <span className="overline">الفنيين</span>
          <h2>الفنيون المسجّلون</h2>
        </div>
        <button className="link" onClick={onAll}>شوف الكل ←</button>
      </div>
      <div className="p-grid">
        {providers.slice(0, 6).map((p) => <ProviderCard key={p.id} p={p} onOpen={onOpen} onRequest={onRequest} />)}
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    { icon: '🔎', title: 'دوّر واختار', text: 'قلّب في الأقسام أو ابحث بالاسم والمنطقة بين الفنيين المعتمدين.' },
    { icon: '📩', title: 'ابعت طلبك', text: 'اكتب المشكلة ورقمك، والطلب بيتسجل عندنا في نفس اللحظة.' },
    { icon: '🤝', title: 'إحنا ننسق', text: 'فريق خدمات قنا يوصّلك بأنسب فني متاح في منطقتك على موبايلك.' },
  ]
  return (
    <section className="section">
      <span className="overline">٣ خطوات وبس</span>
      <h2>بتشتغل إزاي؟</h2>
      <div className="steps">
        {steps.map((s, i) => (
          <div key={i} className="step">
            <span className="step-num">{i + 1}</span>
            <span className="step-icon">{s.icon}</span>
            <b>{s.title}</b>
            <p>{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function WhyUs() {
  const items = [
    { icon: '✅', title: 'مراجعة قبل الظهور', text: 'أي فني بيسجل بنفسه، وبياناته بتتراجع قبل ما يظهر في القوائم.' },
    { icon: '🔒', title: 'خصوصية محترمة', text: 'أرقام الفنيين مش منشورة — التواصل بيتم بتنسيق من إدارة المنصة.' },
    { icon: '📍', title: 'صعيدي وأصلي', text: 'مصممة لقنا ومراكزها، بلهجتنا وعلى قد احتياجنا.' },
    { icon: '💰', title: 'مجاني في الإطلاق', text: 'التسجيل وطلب الخدمة مجانيين تمامًا في فترة الإطلاق.' },
  ]
  return (
    <section className="section">
      <span className="overline">ليه إحنا</span>
      <h2>ليه خدمات قنا؟</h2>
      <div className="why-grid">
        {items.map((it, i) => (
          <div key={i} className="why-card">
            <span>{it.icon}</span>
            <b>{it.title}</b>
            <p>{it.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function JoinBand({ onJoin }) {
  return (
    <section className="join-band">
      <div>
        <h2>انت فني شاطر؟ 🛠️</h2>
        <p>سجّل بياناتك بنفسك في دقيقة، فريقنا يراجعها ويفعّل حسابك، وشغلك يوصل لبيوت قنا كلها — مجانًا في فترة الإطلاق.</p>
      </div>
      <button className="btn-yellow" onClick={onJoin}>سجّل كفني دلوقتي <span className="btn-arrow">←</span></button>
    </section>
  )
}

function Footer({ onNav }) {
  return (
    <footer className="footer">
      <div className="brand"><img className="brand-logo" src="/icon.svg" alt="شعار خدمات قنا" /><span className="brand-name"><em>خدمات</em> <strong>قنا</strong></span></div>
      <nav>
        <button onClick={() => onNav('home')}>الرئيسية</button>
        <button onClick={() => onNav('categories')}>الأقسام</button>
        <button onClick={() => onNav('join')}>سجّل كفني</button>
        <button onClick={() => onNav('request')}>اطلب خدمة</button>
      </nav>
      <p>منصة صعيدية بتجمع أهل قنا بأمهر الفنيين ومقدمي الخدمات في المحافظة.</p>
      <p className="muted">© 2026 خدمات قنا · نسخة إطلاق أولى · من إنتاج <a href="https://genie-zeta-gold.vercel.app/" target="_blank" rel="noreferrer">Genie</a> · صُنعت في قنا ❤️</p>
    </footer>
  )
}

function BottomNav({ view, onNav }) {
  const items = [
    { id: 'home', icon: '🏠', label: 'الرئيسية' },
    { id: 'categories', icon: '🧰', label: 'الأقسام' },
    { id: 'request', icon: '📩', label: 'اطلب خدمة' },
    { id: 'join', icon: '🙋', label: 'سجّل كفني' },
  ]
  return (
    <nav className="bottom-nav">
      {items.map((it) => (
        <button key={it.id} className={view === it.id ? 'active' : ''} onClick={() => onNav(it.id)}>
          <span>{it.icon}</span>
          <small>{it.label}</small>
        </button>
      ))}
    </nav>
  )
}

function Modal({ children, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="إغلاق">✕</button>
        {children}
      </div>
    </div>
  )
}

function ProviderModal({ p, onClose, onRequest }) {
  const cat = catById(p.category)
  return (
    <Modal onClose={onClose}>
      <div className="pm-head">
        <div className="avatar-ring lg"><div className="avatar lg">{p.name.trim().slice(0, 1)}</div></div>
        <div>
          <h3>{p.name}</h3>
          <small>{cat.icon} {cat.name} · 📍 {p.district}</small>
        </div>
      </div>
      <div className="p-meta big">
        {p.years != null && <span>⏳ خبرة {p.years} سنة</span>}
        <span>✅ معتمد من إدارة المنصة</span>
      </div>
      {p.bio && <p className="pm-about">{p.bio}</p>}
      <button className="btn-primary wide" onClick={() => onRequest(p)}>اطلب {cat.name} من {p.name.split(' ')[0]}</button>
      <small className="muted center">ابعت طلبك وإحنا ننسق بينك وبين الفني — رقمك مش بينشر.</small>
    </Modal>
  )
}

function RequestForm({ provider, onClose }) {
  const [form, setForm] = useState({ name: '', phone: '', cat: provider ? provider.category : CATEGORIES[0].id, district: DISTRICTS[0], details: '', website: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const validPhone = PHONE_RE.test(form.phone.trim())
  const valid = form.name.trim().length >= 2 && validPhone && form.details.trim().length >= 5

  async function submit(e) {
    e.preventDefault()
    if (!valid || busy) return
    if (form.website) { setDone(true); return } // honeypot: pretend success, store nothing
    setBusy(true)
    setError('')
    const details = provider ? `الفني المطلوب: ${provider.name}\n${form.details.trim()}` : form.details.trim()
    const { error: err } = await supabase.from('requests').insert({
      customer_name: form.name.trim(),
      phone: form.phone.trim(),
      category: form.cat,
      district: form.district,
      details,
    })
    setBusy(false)
    if (err) {
      setError(isDupError(err) ? 'وصلنا طلب من الرقم ده خلال آخر ٢٤ ساعة — هنرد عليك على نفس الرقم.' : 'حصلت مشكلة في الإرسال، جرّب تاني.')
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <Modal onClose={onClose}>
        <div className="success">
          <span className="big-check">✅</span>
          <h3>طلبك اتسجل!</h3>
          <p>طلبك وصل لفريق خدمات قنا وهنكلمك على موبايلك بأنسب فني متاح. لو مستعجل، ابعت نسخة على واتساب:</p>
          <a className="btn-whatsapp wide" href={waLink(`طلب خدمة من تطبيق خدمات قنا 📍\nالاسم: ${form.name}\nالقسم: ${catById(form.cat).name}\nالمنطقة: ${form.district}\nالتفاصيل: ${form.details}`)} target="_blank" rel="noreferrer">💬 ابعت نسخة واتساب</a>
          <button className="btn-primary wide" onClick={onClose}>تمام</button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal onClose={onClose}>
      <h3>اطلب خدمة 📩</h3>
      {provider && <p className="muted">الفني: <b>{provider.name}</b></p>}
      <form onSubmit={submit} className="form">
        <input className="hp-field" tabIndex="-1" autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} aria-hidden="true" />
        <label>اسمك
          <input value={form.name} maxLength={80} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثلاً: أحمد محمد" />
        </label>
        <label>رقم الموبايل
          <input dir="ltr" inputMode="numeric" value={form.phone} maxLength={11} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01xxxxxxxxx" />
          {form.phone && !validPhone && <small className="err">رقم موبايل مصري ١١ رقم يبدأ بـ 01</small>}
        </label>
        {!provider && (
          <label>نوع الخدمة
            <select value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </label>
        )}
        <label>المنطقة / المركز
          <select value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}>
            {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </label>
        <label>اشرح اللي محتاجه
          <textarea rows="3" maxLength={900} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} placeholder="مثلاً: الحنفية بتسرب مية في الحمام ومحتاج حد يجي النهاردة" />
        </label>
        {error && <small className="err">{error}</small>}
        <button className="btn-primary wide" disabled={!valid || busy}>{busy ? 'بنبعت…' : 'سجّل الطلب'}</button>
        <small className="muted center">رقمك بيتستخدم للتواصل بس، ومش بينشر في أي مكان.</small>
      </form>
    </Modal>
  )
}

function JoinForm({ onClose }) {
  const [form, setForm] = useState({ name: '', cat: CATEGORIES[0].id, district: DISTRICTS[0], phone: '', years: '', bio: '', website: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const validPhone = PHONE_RE.test(form.phone.trim())
  const valid = form.name.trim().length >= 2 && validPhone

  async function submit(e) {
    e.preventDefault()
    if (!valid || busy) return
    if (form.website) { setDone(true); return } // honeypot
    setBusy(true)
    setError('')
    const years = form.years.trim() === '' ? null : Math.max(0, Math.min(70, parseInt(form.years, 10) || 0))
    const { error: err } = await supabase.from('provider_applications').insert({
      name: form.name.trim(),
      phone: form.phone.trim(),
      category: form.cat,
      district: form.district,
      years,
      bio: form.bio.trim() || null,
    })
    setBusy(false)
    if (err) {
      setError(isDupError(err) ? 'سجلت بالرقم ده قبل كده — طلبك قيد المراجعة وهنكلمك قريب.' : 'حصلت مشكلة في التسجيل، جرّب تاني.')
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <Modal onClose={onClose}>
        <div className="success">
          <span className="big-check">🎉</span>
          <h3>تسجيلك وصل!</h3>
          <p>بياناتك اتسجلت عندنا ودلوقتي قيد المراجعة. بعد الاعتماد هتظهر في قوائم الفنيين وهنكلمك على رقمك. التسجيل مجاني في فترة الإطلاق.</p>
          <button className="btn-primary wide" onClick={onClose}>تمام</button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal onClose={onClose}>
      <h3>سجّل كفني 🙋</h3>
      <p className="muted">بتسجل بنفسك، وإحنا بنراجع البيانات قبل ما تظهر على المنصة.</p>
      <form onSubmit={submit} className="form">
        <input className="hp-field" tabIndex="-1" autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} aria-hidden="true" />
        <label>اسمك أو اسم الورشة
          <input value={form.name} maxLength={80} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثلاً: أسطى محمود" />
        </label>
        <label>المهنة
          <select value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </label>
        <label>المنطقة / المركز
          <select value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}>
            {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </label>
        <label>رقم الموبايل (واتساب يفضل)
          <input dir="ltr" inputMode="numeric" value={form.phone} maxLength={11} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01xxxxxxxxx" />
          {form.phone && !validPhone && <small className="err">رقم موبايل مصري ١١ رقم يبدأ بـ 01</small>}
          <small className="muted">رقمك مش بينشر — بيتستخدم للتواصل معاك بس.</small>
        </label>
        <label>سنين الخبرة (اختياري)
          <input dir="ltr" inputMode="numeric" value={form.years} maxLength={2} onChange={(e) => setForm({ ...form, years: e.target.value })} placeholder="مثلاً: 10" />
        </label>
        <label>نبذة عن شغلك (اختياري)
          <textarea rows="2" maxLength={500} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="مثلاً: متخصص تأسيس وصيانة سباكة، شغل مضمون وفي الميعاد" />
        </label>
        {error && <small className="err">{error}</small>}
        <button className="btn-yellow wide" disabled={!valid || busy}>{busy ? 'بنسجل…' : 'سجّل بياناتك'}</button>
      </form>
    </Modal>
  )
}

function Listing({ title, subtitle, list, loading, onOpen, onRequest, onJoin }) {
  const [district, setDistrict] = useState('الكل')
  const filtered = useMemo(() => {
    return district === 'الكل' ? list : list.filter((p) => p.district === district)
  }, [list, district])
  return (
    <section className="section listing">
      <h2>{title}</h2>
      {subtitle && <p className="section-sub">{subtitle}</p>}
      <div className="filters">
        <select value={district} onChange={(e) => setDistrict(e.target.value)}>
          <option>الكل</option>
          {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <span className="count">{filtered.length} فني</span>
      </div>
      {loading ? (
        <SkeletonCards />
      ) : filtered.length === 0 ? (
        <EmptyProviders onJoin={onJoin} compact />
      ) : (
        <div className="p-grid">
          {filtered.map((p) => <ProviderCard key={p.id} p={p} onOpen={onOpen} onRequest={onRequest} />)}
        </div>
      )}
    </section>
  )
}

export default function App() {
  const [view, setView] = useState('home')
  const [query, setQuery] = useState('')
  const [catId, setCatId] = useState(null)
  const [modal, setModal] = useState(null)
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    supabase
      .from('providers')
      .select('id, name, category, district, years, bio, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (alive) { setProviders(data || []); setLoading(false) }
      })
    return () => { alive = false }
  }, [])

  function go(v) {
    setView(v)
    if (v === 'request') setModal({ type: 'request' })
    else if (v === 'join') setModal({ type: 'join' })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openCat(id) {
    setCatId(id)
    setView('category')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function doSearch() {
    setView('search')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const results = useMemo(() => {
    const q = query.trim()
    if (!q) return []
    return providers.filter((p) => {
      const cat = catById(p.category)
      return [p.name, cat.name, p.district, p.bio || ''].join(' ').includes(q)
    })
  }, [query, providers])

  return (
    <div className="app">
      <Header onNav={go} />
      {view === 'home' && (
        <>
          <Hero query={query} setQuery={setQuery} onSearch={doSearch} onCat={openCat} providerCount={providers.length} />
          <Categories onCat={openCat} providers={providers} />
          <Featured
            providers={providers}
            loading={loading}
            onOpen={(p) => setModal({ type: 'provider', p })}
            onRequest={(p) => setModal({ type: 'request', p })}
            onJoin={() => setModal({ type: 'join' })}
            onAll={() => { setCatId(null); setView('category'); window.scrollTo({ top: 0 }) }}
          />
          <HowItWorks />
          <WhyUs />
          <JoinBand onJoin={() => setModal({ type: 'join' })} />
        </>
      )}
      {view === 'categories' && <Categories onCat={openCat} providers={providers} />}
      {view === 'category' && (
        <Listing
          title={catId ? `${catById(catId).icon} ${catById(catId).name}` : 'كل الفنيين'}
          subtitle={catId ? catById(catId).desc : 'كل الفنيين المعتمدين على المنصة'}
          list={catId ? providers.filter((p) => p.category === catId) : providers}
          loading={loading}
          onOpen={(p) => setModal({ type: 'provider', p })}
          onRequest={(p) => setModal({ type: 'request', p })}
          onJoin={() => setModal({ type: 'join' })}
        />
      )}
      {view === 'search' && (
        <Listing
          title={`نتائج البحث: "${query}"`}
          list={results}
          loading={loading}
          onOpen={(p) => setModal({ type: 'provider', p })}
          onRequest={(p) => setModal({ type: 'request', p })}
          onJoin={() => setModal({ type: 'join' })}
        />
      )}
      <Footer onNav={go} />
      <BottomNav view={view} onNav={go} />
      {modal?.type === 'provider' && <ProviderModal p={modal.p} onClose={() => setModal(null)} onRequest={(p) => setModal({ type: 'request', p })} />}
      {modal?.type === 'request' && <RequestForm provider={modal.p} onClose={() => setModal(null)} />}
      {modal?.type === 'join' && <JoinForm onClose={() => setModal(null)} />}
    </div>
  )
}
