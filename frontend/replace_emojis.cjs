const fs = require('fs');
const path = 'c:/Users/wheny/OneDrive/Desktop/samruddhigoldpalace/frontend/src/pages/AdminPanel.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update imports
const importLucide = "import { FileText, Package, Link as LinkIcon, Image as ImageIcon, Ruler, Gem, Calculator, DollarSign, Folder, Shield, TrendingUp } from 'lucide-react';\n";
if (!content.includes('import { FileText')) {
  content = content.replace(/import React(.*?)\n/, "import React$1\n" + importLucide);
}

// 2. Update SCard definition
content = content.replace(
  "const SCard: React.FC<{ icon: string; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (",
  "const SCard: React.FC<{ icon: React.ReactNode | string; title: string; children: React.ReactNode }> = ({ icon, title, children }) => ("
);

// 3. Replace all SCard usages
content = content.replace(/<SCard icon="📋" title="General Information"/g, '<SCard icon={<FileText className="w-6 h-6 text-[#A56B25]" />} title="General Information"');
content = content.replace(/<SCard icon="📦" title="Inventory & Shipping"/g, '<SCard icon={<Package className="w-6 h-6 text-[#A56B25]" />} title="Inventory & Shipping"');
content = content.replace(/<SCard icon="🔗" title="Advanced & Linked Products"/g, '<SCard icon={<LinkIcon className="w-6 h-6 text-[#A56B25]" />} title="Advanced & Linked Products"');
content = content.replace(/<SCard icon="🖼️" title="Media & Gallery"/g, '<SCard icon={<ImageIcon className="w-6 h-6 text-[#A56B25]" />} title="Media & Gallery"');
content = content.replace(/<SCard icon="📏" title="Jewelry Specifications"/g, '<SCard icon={<Ruler className="w-6 h-6 text-[#A56B25]" />} title="Jewelry Specifications"');
content = content.replace(/<SCard icon="💎" title="Diamond & Stone Details"/g, '<SCard icon={<Gem className="w-6 h-6 text-[#A56B25]" />} title="Diamond & Stone Details"');
content = content.replace(/<SCard icon="💰" title="Price Breakup & Dynamic Calculator"/g, '<SCard icon={<Calculator className="w-6 h-6 text-[#A56B25]" />} title="Price Breakup & Dynamic Calculator"');
content = content.replace(/<SCard icon="💵" title="Pricing & Status"/g, '<SCard icon={<DollarSign className="w-6 h-6 text-[#A56B25]" />} title="Pricing & Status"');
content = content.replace(/<SCard icon="📂" title="Category Settings"/g, '<SCard icon={<Folder className="w-6 h-6 text-[#A56B25]" />} title="Category Settings"');
content = content.replace(/<SCard icon="📋" title="Daily Live Rates"/g, '<SCard icon={<FileText className="w-6 h-6 text-[#A56B25]" />} title="Daily Live Rates"');
content = content.replace(/<SCard icon="🛡️" title="Change Admin Password"/g, '<SCard icon={<Shield className="w-6 h-6 text-[#A56B25]" />} title="Change Admin Password"');
content = content.replace(/<SCard icon="📈" title=\{editMId \? 'Edit Rate' : 'Add New Rate'\}/g, "<SCard icon={<TrendingUp className=\"w-6 h-6 text-[#A56B25]\" />} title={editMId ? 'Edit Rate' : 'Add New Rate'}");

fs.writeFileSync(path, content);
