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

//  ADD THIS MISSING FUNCTION
async function generateFeedbackExcel(feedbackData) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Customer Feedback');

  // Define columns
  worksheet.columns = [
    { header: 'Feedback ID', key: 'id', width: 12 },
    { header: 'Customer Name', key: 'customer_name', width: 25 },
    { header: 'Email', key: 'customer_email', width: 30 },
    { header: 'Feedback Type', key: 'feedback_type', width: 20 },
    { header: 'Rating', key: 'rating', width: 10 },
    { header: 'Message', key: 'message', width: 50 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Submitted On', key: 'created_at', width: 20 },
    { header: 'Last Updated', key: 'updated_at', width: 20 }
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF6366F1' } // Indigo color for feedback
  };

  // Add data rows
  feedbackData.forEach(feedback => {
    worksheet.addRow({
      id: feedback.id,
      customer_name: feedback.customer_name,
      customer_email: feedback.customer_email,
      feedback_type: feedback.feedback_type.replace(/_/g, ' ').toUpperCase(),
      rating: feedback.rating,
      message: feedback.message,
      status: feedback.status,
      created_at: new Date(feedback.created_at).toLocaleString(),
      updated_at: new Date(feedback.updated_at).toLocaleString()
    });
  });

  // Apply conditional formatting for rating
  worksheet.getColumn('rating').eachCell((cell, rowNumber) => {
    if (rowNumber > 1) {
      const rating = parseInt(cell.value);
      if (rating === 5) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      } else if (rating === 4) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } };
        cell.font = { color: { argb: 'FFFFFFFF' } };
      } else if (rating === 3) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } };
        cell.font = { color: { argb: 'FFFFFFFF' } };
      } else if (rating === 2) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF97316' } };
        cell.font = { color: { argb: 'FFFFFFFF' } };
      } else if (rating === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEF4444' } };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      }
    }
  });

  // Apply conditional formatting for status
  worksheet.getColumn('status').eachCell((cell, rowNumber) => {
    if (rowNumber > 1) {
      if (cell.value === 'Resolved') {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4EDDA' } };
        cell.font = { color: { argb: 'FF155724' } };
      } else if (cell.value === 'New') {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F9FF' } };
        cell.font = { color: { argb: 'FF0369A1' } };
      } else if (cell.value === 'In Review') {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
        cell.font = { color: { argb: 'FF856404' } };
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

  // Add summary statistics at the bottom
  const summaryRow = worksheet.rowCount + 2;
  
  // Calculate statistics
  const totalFeedback = feedbackData.length;
  const avgRating = (feedbackData.reduce((sum, f) => sum + f.rating, 0) / totalFeedback).toFixed(2);
  const fiveStarCount = feedbackData.filter(f => f.rating === 5).length;
  const resolvedCount = feedbackData.filter(f => f.status === 'Resolved').length;

  worksheet.getCell(`A${summaryRow}`).value = 'SUMMARY STATISTICS';
  worksheet.getCell(`A${summaryRow}`).font = { bold: true, size: 12 };
  worksheet.mergeCells(`A${summaryRow}:C${summaryRow}`);

  worksheet.getCell(`A${summaryRow + 1}`).value = 'Total Feedback:';
  worksheet.getCell(`B${summaryRow + 1}`).value = totalFeedback;
  worksheet.getCell(`A${summaryRow + 2}`).value = 'Average Rating:';
  worksheet.getCell(`B${summaryRow + 2}`).value = avgRating;
  worksheet.getCell(`A${summaryRow + 3}`).value = '5-Star Ratings:';
  worksheet.getCell(`B${summaryRow + 3}`).value = fiveStarCount;
  worksheet.getCell(`A${summaryRow + 4}`).value = 'Resolved:';
  worksheet.getCell(`B${summaryRow + 4}`).value = resolvedCount;

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

module.exports = {
  generateArtworkExcel,
  generateOrderExcel,
  generateFeedbackExcel  
};