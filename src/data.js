export const CATEGORIES = [
  { id: 'plumbing', name: 'سباكة', icon: '🔧', desc: 'تأسيس وصيانة وتسريبات' },
  { id: 'electric', name: 'كهرباء', icon: '⚡', desc: 'تأسيس، صيانة، وعدادات' },
  { id: 'tutoring', name: 'دروس خصوصية', icon: '🎓', desc: 'كل المراحل والمواد' },
  { id: 'ac', name: 'تكييف وتبريد', icon: '❄️', desc: 'تركيب وصيانة وتنظيف' },
  { id: 'carpentry', name: 'نجارة', icon: '🪚', desc: 'أثاث وأبواب وشبابيك' },
  { id: 'painting', name: 'دهانات وديكور', icon: '🎨', desc: 'دهانات وتشطيبات' },
  { id: 'cleaning', name: 'تنظيف', icon: '🧹', desc: 'شقق وشركات وعمائر' },
  { id: 'mobile', name: 'صيانة موبايل', icon: '📱', desc: 'شاشات، بطاريات، سوفتوير' },
  { id: 'moving', name: 'نقل وعفش', icon: '🚚', desc: 'نقل داخل قنا والمراكز' },
  { id: 'appliances', name: 'صيانة أجهزة', icon: '🛠️', desc: 'غسالات وثلاجات وبوتاجازات' },
]

export const DISTRICTS = [
  'مدينة قنا',
  'قنا الجديدة',
  'سمهود',
  'دشنا',
  'الوقف',
  'قفط',
  'قوص',
  'نجع حمادي',
  'أبو تشت',
]

export const OWNER_WHATSAPP = '201026795965'

export function catById(id) {
  return CATEGORIES.find((c) => c.id === id) || { id, name: id, icon: '🧰', desc: '' }
}
