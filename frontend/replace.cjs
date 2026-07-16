const fs = require('fs');
const path = 'c:/Users/wheny/OneDrive/Desktop/samruddhigoldpalace/frontend/src/pages/AdminPanel.tsx';
let content = fs.readFileSync(path, 'utf8');

// Categories
const catSearch = `<button onClick={fetchCategories} className="px-4 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517]/70 text-xs font-semibold rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37]/60 transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>`;
const catIdx = content.indexOf(catSearch);
if(catIdx !== -1) {
  const catEnd = content.indexOf('</button>', catIdx);
  const matched = content.substring(catIdx, catEnd + 9);
  content = content.replace(matched, `<button onClick={() => exportToCSV(categories, 'categories.csv')} className="px-4 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517]/70 text-xs font-semibold rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37]/60 transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>📥 Export</button>\n            ` + matched);
}

// Orders
const orderSearch = `<button onClick={fetchOrders} className="px-4 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517]/70 text-xs font-semibold rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37]/60 transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>`;
const orderIdx = content.indexOf(orderSearch);
if(orderIdx !== -1) {
  const orderEnd = content.indexOf('</button>', orderIdx);
  const matchedOrder = content.substring(orderIdx, orderEnd + 9);
  content = content.replace(matchedOrder, `<button onClick={() => exportToCSV(filteredOrders, 'orders.csv')} className="px-4 py-2.5 bg-white border border-[#D4AF37]/30 shadow-sm text-[#5F1517]/70 text-xs font-semibold rounded-xl hover:bg-[#FFF7F2] hover:border-[#D4AF37]/60 transition" style={{ fontFamily: 'Montserrat, sans-serif' }}>📥 Export</button>\n            ` + matchedOrder);
}

fs.writeFileSync(path, content);
