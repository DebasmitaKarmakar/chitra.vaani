const ExcelJS = require('exceljs');

// Generate Excel for Artworks
async function generateArtworkExcel(artworks) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Artworks');

  // Define columns
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Title', key: 'title', width: 30 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Price', key: 'price', width: 15 },
    { header: 'Medium', key: 'medium', width: 20 },
    { header: 'Dimensions', key: 'dimensions', width: 20 },
    { header: 'Year', key: 'year', width: 10 },
    { header: 'Photo Count', key: 'photo_count', width: 15 },
    { header: 'Created At', key: 'created_at', width: 20 }
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF8B7355' }
  };

  // Add data rows
  artworks.forEach(artwork => {
    const photoCount = artwork.photos ? (Array.isArray(artwork.photos) ? artwork.photos.length : 0) : 0;
    
    worksheet.addRow({
      id: artwork.id,
      title: artwork.title,
      category: artwork.category || artwork.category_name || 'N/A',
      price: artwork.price,
      medium: artwork.medium || 'N/A',
      dimensions: artwork.dimensions || 'N/A',
      year: artwork.year || 'N/A',
      photo_count: photoCount,
      created_at: new Date(artwork.created_at).toLocaleString()
    });
  });

  // Add borders
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell(cell => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

// Generate Excel for Orders
async function generateOrderExcel(orders) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Orders');

  // Define columns
  worksheet.columns = [
    { header: 'Order ID', key: 'id', width: 10 },
    { header: 'Order Type', key: 'order_type', width: 15 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Customer Name', key: 'customer_name', width: 25 },
    { header: 'Email', key: 'customer_email', width: 30 },
    { header: 'Phone', key: 'customer_phone', width: 15 },
    { header: 'Artwork/Item', key: 'artwork_title', width: 30 },
    { header: 'Delivery Address', key: 'delivery_address', width: 40 },
    { header: 'Order Date', key: 'created_at', width: 20 }
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF8B7355' }
  };

  // Add data rows
  orders.forEach(order => {
    const details = order.order_details || {};
    
    worksheet.addRow({
      id: order.id,
      order_type: order.order_type.toUpperCase(),
      status: order.status,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone || 'N/A',
      artwork_title: order.artwork_title || details.itemType || 'Custom',
      delivery_address: order.delivery_address || 'N/A',
      created_at: new Date(order.created_at).toLocaleString()
    });
  });

  // Apply conditional formatting for status
  worksheet.getColumn('status').eachCell((cell, rowNumber) => {
    if (rowNumber > 1) {
      if (cell.value === 'Completed') {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD4EDDA' }
        };
        cell.font = { color: { argb: 'FF155724' } };
      } else if (cell.value === 'Pending') {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFF3CD' }
        };
        cell.font = { color: { argb: 'FF856404' } };
      } else if (cell.value === 'Cancelled') {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8D7DA' }
        };
        cell.font = { color: { argb: 'FF721C24' } };
      }
    }
  });

  // Add borders
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell(cell => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  
  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

module.exports = {
  generateArtworkExcel,
  generateOrderExcel
};