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

// Generate Excel for Feedback
async function generateFeedbackExcel(feedbackData) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Customer Feedback');

  // Define columns
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 8 },
    { header: 'Date & Time', key: 'created_at', width: 20 },
    { header: 'Customer Name', key: 'customer_name', width: 25 },
    { header: 'Email', key: 'customer_email', width: 30 },
    { header: 'Feedback Type', key: 'feedback_type', width: 20 },
    { header: 'Rating', key: 'rating', width: 10 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Message', key: 'message', width: 50 }
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true, size: 12 };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  };
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).height = 25;

  // Add data rows
  feedbackData.forEach((feedback) => {
    const row = worksheet.addRow({
      id: feedback.id,
      created_at: new Date(feedback.created_at).toLocaleString(),
      customer_name: feedback.customer_name,
      customer_email: feedback.customer_email,
      feedback_type: feedback.feedback_type.replace(/_/g, ' ').toUpperCase(),
      rating: `${'⭐'.repeat(feedback.rating)} (${feedback.rating}/5)`,
      status: feedback.status,
      message: feedback.message
    });

    // Color code by rating
    let ratingColor = 'FFFFFFFF'; // white default
    if (feedback.rating === 5) ratingColor = 'FFD4EDDA'; // light green
    else if (feedback.rating === 4) ratingColor = 'FFCFE2FF'; // light blue
    else if (feedback.rating === 3) ratingColor = 'FFFFF3CD'; // light yellow
    else if (feedback.rating === 2) ratingColor = 'FFFFE5D0'; // light orange
    else if (feedback.rating === 1) ratingColor = 'FFF8D7DA'; // light red

    row.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: ratingColor }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { vertical: 'top', wrapText: true };
    });

    // Color code status column
    const statusCell = row.getCell('status');
    if (feedback.status === 'New') {
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFF3CD' }
      };
      statusCell.font = { bold: true, color: { argb: 'FF856404' } };
    } else if (feedback.status === 'Resolved') {
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD4EDDA' }
      };
      statusCell.font = { bold: true, color: { argb: 'FF155724' } };
    } else if (feedback.status === 'In Review') {
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFCFE2FF' }
      };
      statusCell.font = { bold: true, color: { argb: 'FF004085' } };
    }
  });

  // Add summary statistics at the bottom
  worksheet.addRow([]);
  const summaryStartRow = worksheet.rowCount + 1;
  
  worksheet.addRow(['FEEDBACK SUMMARY']);
  worksheet.getRow(summaryStartRow).font = { bold: true, size: 14 };
  worksheet.mergeCells(`A${summaryStartRow}:H${summaryStartRow}`);

  const totalFeedback = feedbackData.length;
  const avgRating = totalFeedback > 0 ? (feedbackData.reduce((sum, f) => sum + f.rating, 0) / totalFeedback).toFixed(2) : '0.00';
  const fiveStar = feedbackData.filter(f => f.rating === 5).length;
  const fourStar = feedbackData.filter(f => f.rating === 4).length;
  const threeStar = feedbackData.filter(f => f.rating === 3).length;
  const twoStar = feedbackData.filter(f => f.rating === 2).length;
  const oneStar = feedbackData.filter(f => f.rating === 1).length;

  const newCount = feedbackData.filter(f => f.status === 'New').length;
  const resolvedCount = feedbackData.filter(f => f.status === 'Resolved').length;
  const inReviewCount = feedbackData.filter(f => f.status === 'In Review').length;

  worksheet.addRow(['Total Feedback:', totalFeedback]);
  worksheet.addRow(['Average Rating:', avgRating + ' ⭐']);
  worksheet.addRow(['5 Star:', fiveStar]);
  worksheet.addRow(['4 Star:', fourStar]);
  worksheet.addRow(['3 Star:', threeStar]);
  worksheet.addRow(['2 Star:', twoStar]);
  worksheet.addRow(['1 Star:', oneStar]);
  worksheet.addRow(['New:', newCount]);
  worksheet.addRow(['In Review:', inReviewCount]);
  worksheet.addRow(['Resolved:', resolvedCount]);

  // Style summary rows
  for (let i = summaryStartRow + 1; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i);
    row.font = { bold: true };
    row.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE2E8F0' }
    };
  }

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

module.exports = {
  generateArtworkExcel,
  generateOrderExcel,
  generateFeedbackExcel
};