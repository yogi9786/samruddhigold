import re
import os

filepath = r'c:\Users\wheny\OneDrive\Desktop\samruddhigoldpalace\frontend\src\pages\AdminPanel.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the render functions
start_remove = content.find('// ─── DASHBOARD ────────────────────────────────────────────────────────────────')
end_remove = content.find('// ─── MAIN LAYOUT ──────────────────────────────────────────────────────────────')

if start_remove != -1 and end_remove != -1:
    content = content[:start_remove] + content[end_remove:]

# Now replace the rendering section
render_replacements = '''
          {section === 'dashboard' && <Dashboard stats={stats} orders={orders} setSection={setSection} refreshAll={refreshAll} setPForm={setPForm} setEditPId={setEditPId} emptyProduct={emptyProduct} />}
          {section === 'all-products' && <ProductList products={products} categories={categories} pSearch={pSearch} setPSearch={setPSearch} pCatFilter={pCatFilter} setPCatFilter={setPCatFilter} exportToCSV={exportToCSV} fetchProducts={fetchProducts} emptyProduct={emptyProduct} setPForm={setPForm} setEditPId={setEditPId} setPMsg={setPMsg} setSection={setSection} startEditProduct={startEditProduct} deleteProduct={deleteProduct} />}
          {section === 'add-product' && <ProductForm editPId={editPId} setSection={setSection} setEditPId={setEditPId} setPForm={setPForm} emptyProduct={emptyProduct} setPMsg={setPMsg} hasSnapshot={!!pSnapshot.current} handleRollbackProduct={handleRollbackProduct} pMsg={pMsg} handlePSubmit={handlePSubmit} pForm={pForm} handlePInput={handlePInput} categories={categories} uploadMain={uploadMain} uploadingMain={uploadingMain} uploadGallery={uploadGallery} uploadingGallery={uploadingGallery} />}
          {section === 'all-categories' && <CategoryList categories={categories} cSearch={cSearch} setCSearch={setCSearch} exportToCSV={exportToCSV} fetchCategories={fetchCategories} emptyCat={emptyCat} setCForm={setCForm} setEditCId={setEditCId} setCMsg={setCMsg} setSection={setSection} startEditCat={startEditCat} deleteCat={deleteCat} products={products} />}
          {section === 'add-category' && <CategoryForm editCId={editCId} setSection={setSection} setEditCId={setEditCId} setCForm={setCForm} emptyCat={emptyCat} cMsg={cMsg} hasSnapshot={!!cSnapshot.current} handleRollbackCat={handleRollbackCat} handleCatSubmit={handleCatSubmit} cForm={cForm} handleCInput={handleCInput} categories={categories} uploadCatImg={uploadCatImg} uploadingCat={uploadingCat} />}
          {section === 'orders' && <OrderList filteredOrders={filteredOrders} oSearch={oSearch} setOSearch={setOSearch} oStatusFilter={oStatusFilter} setOStatusFilter={setOStatusFilter} exportToCSV={exportToCSV} fetchOrders={fetchOrders} updateOrderStatus={updateOrderStatus} />}
          {section === 'virtual-bookings' && <VirtualBookings virtualBookings={virtualBookings} vSearch={vSearch} setVSearch={setVSearch} vStatusFilter={vStatusFilter} setVStatusFilter={setVStatusFilter} exportToCSV={exportToCSV} fetchVirtualBookings={fetchVirtualBookings} loadingBookings={loadingBookings} updateBookingStatus={updateBookingStatus} viewBookingDetails={viewBookingDetails} deleteBooking={deleteBooking} />}
          {section === 'subscriptions' && <Subscriptions subscriptions={subscriptions} subSearch={subSearch} setSubSearch={setSubSearch} exportToCSV={exportToCSV} fetchSubscriptions={fetchSubscriptions} loadingSubscriptions={loadingSubscriptions} />}
          {section === 'customers' && <CustomerList customers={customers} orders={orders} exportToCSV={exportToCSV} fetchUsers={fetchUsers} />}
          {section === 'users' && <UserList users={users} exportToCSV={exportToCSV} fetchUsers={fetchUsers} />}
          {section === 'change-password' && <Settings pwMsg={pwMsg} pw={pw} setPw={setPw} handleChangePw={handleChangePw} />}
          {section === 'metal-prices' && <MetalPrices editMId={editMId} setEditMId={setEditMId} mForm={mForm} setMForm={setMForm} handleMInput={handleMInput} handleMetalSubmit={handleMetalSubmit} metalPrices={metalPrices} startEditMetal={startEditMetal} deleteMetalPrice={deleteMetalPrice} />}
'''

old_renders = """          {section === 'dashboard' && renderDashboard()}
          {section === 'all-products' && renderAllProducts()}
          {section === 'add-product' && renderProductForm()}
          {section === 'all-categories' && renderAllCategories()}
          {section === 'add-category' && renderCategoryForm()}
          {section === 'orders' && renderOrders()}
          {section === 'virtual-bookings' && renderVirtualBookings()}
          {section === 'subscriptions' && renderSubscriptions()}
          {section === 'customers' && renderCustomers()}
          {section === 'users' && renderUsers()}
          {section === 'change-password' && renderChangePw()}
          {section === 'metal-prices' && renderMetalPrices()}"""

content = content.replace(old_renders, render_replacements)

imports = '''import Dashboard from './admin/views/Dashboard';
import ProductList from './admin/views/ProductList';
import ProductForm from './admin/views/ProductForm';
import CategoryList from './admin/views/CategoryList';
import CategoryForm from './admin/views/CategoryForm';
import OrderList from './admin/views/OrderList';
import CustomerList from './admin/views/CustomerList';
import UserList from './admin/views/UserList';
import MetalPrices from './admin/views/MetalPrices';
import VirtualBookings from './admin/views/VirtualBookings';
import Subscriptions from './admin/views/Subscriptions';
import Settings from './admin/views/Settings';
import { Toast } from './admin/components/UIComponents';
'''
# Add imports
content = content.replace("import React, { useState, useEffect, useRef } from 'react';", "import React, { useState, useEffect, useRef } from 'react';\n" + imports)

# Remove local Toast and Alert implementations as they are now in UIComponents.tsx
toast_start = content.find('const Toast = ')
if toast_start != -1:
    toast_end = content.find(';', content.find('return', toast_start)) + 1
    # finding exactly where Toast ends is tricky, let's just find the end of the arrow function block
    content = content[:toast_start] + content[content.find('const Alert = ', toast_start):]

alert_start = content.find('const Alert = ')
if alert_start != -1:
    alert_end = content.find('};', alert_start) + 2
    content = content[:alert_start] + content[alert_end:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
