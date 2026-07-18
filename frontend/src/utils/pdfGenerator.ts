import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoicePDF = (order: any, payment: any, user: any) => {
  const doc = new jsPDF();
  
  // Colors and styling constants
  const primaryColor: [number, number, number] = [95, 21, 23]; // #5F1517
  const secondaryColor: [number, number, number] = [128, 20, 22]; // #801416
  const goldColor: [number, number, number] = [212, 175, 55]; // #D4AF37
  
  // Helper to format currency
  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString('en-IN')}`;

  // 1. Header Section
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("SAMRUDDHI GOLD PALACE", 14, 25);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Invoice & Payment Receipt", 14, 32);

  // 2. Invoice Meta Information
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  
  const rightColumnX = 120;
  
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE TO:", 14, 55);
  doc.setFont("helvetica", "normal");
  doc.text(order?.full_name || user?.full_name || user?.username || 'Customer', 14, 62);
  doc.text(order?.email || user?.email || '', 14, 67);
  doc.text(order?.contact_phone || '', 14, 72);
  
  const splitAddress = doc.splitTextToSize(order?.shipping_address || 'N/A', 80);
  doc.text(splitAddress, 14, 77);

  doc.setFont("helvetica", "bold");
  doc.text("INVOICE DETAILS:", rightColumnX, 55);
  doc.setFont("helvetica", "normal");
  
  const invoiceDate = payment?.created_at || order?.created_at ? new Date(payment?.created_at || order?.created_at).toLocaleDateString() : new Date().toLocaleDateString();
  
  doc.text(`Order ID:`, rightColumnX, 62);
  doc.text(order?.id?.substring(0, 12)?.toUpperCase() || 'N/A', rightColumnX + 25, 62);
  
  doc.text(`Payment ID:`, rightColumnX, 67);
  doc.text(payment?.razorpay_payment_id || 'N/A', rightColumnX + 25, 67);
  
  doc.text(`Date:`, rightColumnX, 72);
  doc.text(invoiceDate, rightColumnX + 25, 72);
  
  doc.text(`Status:`, rightColumnX, 77);
  doc.setTextColor(0, 128, 0); // Green
  doc.text(payment?.status || order?.status || 'Success', rightColumnX + 25, 77);
  doc.setTextColor(0, 0, 0);

  // 3. Items Table
  let currentY = 100;
  
  const tableData = (order?.items || []).map((item: any, index: number) => [
    index + 1,
    item.product?.name || `Product ID: ${item.product_id?.substring(0,8) || ''}`,
    item.quantity,
    formatCurrency(item.price),
    formatCurrency(item.price * item.quantity)
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['#', 'Item Description', 'Qty', 'Unit Price', 'Total']],
    body: tableData.length > 0 ? tableData : [['1', 'Jewellery Purchase', '1', formatCurrency(order?.total_amount || 0), formatCurrency(order?.total_amount || 0)]],
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      2: { cellWidth: 20, halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'right' },
    }
  });

  // 4. Totals Section
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Total Amount Paid:", 120, finalY);
  
  doc.setTextColor(...secondaryColor);
  doc.text(formatCurrency(payment?.amount || order?.total_amount || 0), 165, finalY, { align: 'left' });

  // 5. Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(...goldColor);
  doc.rect(0, pageHeight - 15, 210, 15, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for shopping with Samruddhi Gold Palace!", 105, pageHeight - 6, { align: 'center' });

  // Download
  doc.save(`Invoice_${order?.id?.substring(0,8) || 'receipt'}.pdf`);
};
