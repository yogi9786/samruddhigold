import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/samruddhi-logo.png';

export const generateInvoicePDF = (order: any, payment: any, user: any) => {
  try {
    const doc = new jsPDF();
    
    // Colors and styling constants
    const primaryColor: [number, number, number] = [95, 21, 23]; // #5F1517
    const secondaryColor: [number, number, number] = [128, 20, 22]; // #801416
    const goldColor: [number, number, number] = [212, 175, 55]; // #D4AF37
    
    // Helper to format currency
    const formatCurrency = (amount: number) => `Rs. ${(Number(amount) || 0).toLocaleString('en-IN')}`;

    const renderPDF = (logoImg?: HTMLImageElement) => {
      // 1. Header Section
      // Top gold accent strip
      doc.setFillColor(...goldColor);
      doc.rect(0, 0, 210, 3, 'F');

      // Main header bar
      doc.setFillColor(...primaryColor);
      doc.rect(0, 3, 210, 42, 'F');
      
      // Add logo on top left of header
      if (logoImg) {
        try {
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(12, 8, 30, 30, 3, 3, 'F');
          doc.addImage(logoImg, 'PNG', 14, 10, 26, 26);
        } catch (e) {
          console.warn("Logo render notice:", e);
        }
      }

      const textX = logoImg ? 48 : 14;

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("SAMRUDDHI GOLD PALACE", textX, 21);
      
      doc.setTextColor(...goldColor);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("OFFICIAL INVOICE & PAYMENT RECEIPT", textX, 29);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("Kolar | Udupi | Yelahanka  •  www.sirisamruddhigold.com", textX, 36);

      // 2. Customer & Order Meta Information
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      
      const rightColumnX = 120;
      
      doc.setFont("helvetica", "bold");
      doc.text("INVOICE TO:", 14, 58);
      doc.setFont("helvetica", "normal");
      const customerName = order?.full_name || user?.full_name || user?.username || 'Valued Customer';
      const customerEmail = order?.email || user?.email || '';
      const customerPhone = order?.contact_phone || user?.phone || '';

      doc.text(String(customerName), 14, 65);
      if (customerEmail) doc.text(String(customerEmail), 14, 70);
      if (customerPhone) doc.text(String(customerPhone), 14, 75);
      
      // Safe Address formatting
      let addrStr = 'N/A';
      if (order?.shipping_address) {
        if (typeof order.shipping_address === 'string') {
          addrStr = order.shipping_address;
        } else if (typeof order.shipping_address === 'object') {
          const a = order.shipping_address;
          addrStr = a.fullAddress || [a.street, a.city, a.state, a.zip, a.country].filter(Boolean).join(', ') || JSON.stringify(a);
        }
      }
      const splitAddress = doc.splitTextToSize(addrStr, 85);
      doc.text(splitAddress, 14, customerPhone ? 80 : (customerEmail ? 75 : 70));

      // Order Meta
      doc.setFont("helvetica", "bold");
      doc.text("INVOICE DETAILS:", rightColumnX, 58);
      doc.setFont("helvetica", "normal");
      
      const rawDate = payment?.created_at || order?.created_at;
      let invoiceDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      if (rawDate) {
        try {
          const d = new Date(rawDate);
          if (!isNaN(d.getTime())) {
            invoiceDate = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
          }
        } catch (e) {}
      }
      
      const orderIdStr = order?.id ? String(order.id).substring(0, 12).toUpperCase() : (order?.razorpay_order_id || 'N/A');
      const paymentIdStr = payment?.razorpay_payment_id || order?.razorpay_payment_id || 'N/A';
      const statusStr = payment?.status || order?.status || 'Completed';

      doc.text(`Order ID:`, rightColumnX, 65);
      doc.text(orderIdStr, rightColumnX + 25, 65);
      
      doc.text(`Payment ID:`, rightColumnX, 70);
      doc.text(paymentIdStr, rightColumnX + 25, 70);
      
      doc.text(`Date:`, rightColumnX, 75);
      doc.text(invoiceDate, rightColumnX + 25, 75);
      
      doc.text(`Status:`, rightColumnX, 80);
      doc.setTextColor(0, 128, 0); // Green
      doc.text(String(statusStr), rightColumnX + 25, 80);
      doc.setTextColor(0, 0, 0);

      // 3. Items Extraction
      let rawItems: any[] = [];
      if (Array.isArray(order?.items)) {
        rawItems = order.items;
      } else if (typeof order?.items === 'string') {
        try {
          const parsed = JSON.parse(order.items);
          if (Array.isArray(parsed)) rawItems = parsed;
        } catch (e) {
          rawItems = [];
        }
      } else if (order?.items && typeof order.items === 'object') {
        rawItems = Object.values(order.items);
      }

      const totalAmount = Number(order?.total_amount || payment?.amount) || 0;

      const tableData = rawItems.map((item: any, index: number) => {
        const itemName = item?.name || item?.product?.name || item?.title || item?.product_name || (item?.product_id ? `Product ID: ${String(item.product_id).substring(0,8)}` : 'Jewellery Purchase');
        const qty = Number(item?.quantity) || 1;
        const price = Number(item?.price || item?.product?.price) || (totalAmount / Math.max(rawItems.length, 1));
        return [
          index + 1,
          String(itemName),
          qty,
          formatCurrency(price),
          formatCurrency(price * qty)
        ];
      });

      const autoTableOptions = {
        startY: 102,
        head: [['#', 'Item Description', 'Qty', 'Unit Price', 'Total']],
        body: tableData.length > 0 ? tableData : [['1', 'Jewellery Purchase', '1', formatCurrency(totalAmount), formatCurrency(totalAmount)]],
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
      };

      // Execute autoTable safely
      try {
        if (typeof autoTable === 'function') {
          autoTable(doc, autoTableOptions as any);
        } else if (typeof (doc as any).autoTable === 'function') {
          (doc as any).autoTable(autoTableOptions);
        }
      } catch (autoErr) {
        console.warn('autoTable warning:', autoErr);
      }

      // 4. Totals Section
      const lastAutoTable = (doc as any).lastAutoTable;
      const finalY = lastAutoTable && lastAutoTable.finalY ? lastAutoTable.finalY + 15 : 140;
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Total Amount Paid:", 120, finalY);
      
      doc.setTextColor(...secondaryColor);
      doc.text(formatCurrency(totalAmount), 165, finalY, { align: 'left' });

      // 5. Footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFillColor(...goldColor);
      doc.rect(0, pageHeight - 15, 210, 15, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Thank you for shopping with Samruddhi Gold Palace!", 105, pageHeight - 6, { align: 'center' });

      // Save PDF file
      const filename = `Invoice_${orderIdStr !== 'N/A' ? orderIdStr : paymentIdStr}.pdf`;
      doc.save(filename);
    };

    // Load logo image for PDF
    const img = new Image();
    img.src = logo;
    if (img.complete && img.naturalWidth !== 0) {
      renderPDF(img);
    } else {
      img.onload = () => renderPDF(img);
      img.onerror = () => renderPDF(undefined);
    }
  } catch (err: any) {
    console.error("PDF generation failed:", err);
    alert("Failed to generate PDF invoice. " + (err?.message || 'Please try again.'));
  }
};
