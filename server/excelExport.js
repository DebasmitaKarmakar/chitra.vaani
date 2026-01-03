const ExcelJS = require('exceljs');

// Generate Excel for Artworks
async function generateArtworkExcel(artworks) {
  try {
    console.log(`📊 Generating Excel for ${artworks.length} artworks...`);
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Artworks');

    // Define columns
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Title', key: 'title', width: 30 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Artist', key: 'artist', width: 25 },
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
      let photoCount = 0;
      try {
        const photos = typeof artwork.photos === 'string' ? JSON.parse(artwork.photos) : artwork.photos;
        photoCount = Array.isArray(photos) ? photos.length : 0;
      } catch (e) {
        photoCount = 0;
      }
      
      worksheet.addRow({
        id: artwork.id,
        title: artwork.title,
        category: artwork.category_name || artwork.category || 'N/A',
        artist: artwork.artist_name || 'Unknown',
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

    const buffer = await workbook.xlsx.writeBuffer();
    console.log('✅ Artwork Excel generated');
    return buffer;
  } catch (error) {
    console.error('❌ Error generating artwork Excel:', error);
    throw error;
  }
}

// Generate Excel for Orders
async function generateOrderExcel(orders) {
  try {
    console.log(`📊 Generating Excel for ${orders.length} orders...`);
    
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
      let details = {};
      try {
        details = typeof order.order_details === 'string' ? JSON.parse(order.order_details) : order.order_details || {};
      } catch (e) {
        details = {};
      }
      
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

    const buffer = await workbook.xlsx.writeBuffer();
    console.log('✅ Order Excel generated');
    return buffer;
  } catch (error) {
    console.error('❌ Error generating order Excel:', error);
    throw error;
  }
}

// Generate Excel for Artists
async function generateArtistsExcel(artists) {
  try {
    console.log(`📊 Generating Excel for ${artists.length} artists...`);
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Artists');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Location', key: 'location', width: 20 },
      { header: 'Style', key: 'style', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Instagram', key: 'instagram', width: 30 },
      { header: 'Facebook', key: 'facebook', width: 30 },
      { header: 'Website', key: 'website', width: 30 },
      { header: 'Artwork Count', key: 'artwork_count', width: 15 },
      { header: 'Created At', key: 'created_at', width: 22 }
    ];

    // Header style
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF8B7355' }
    };

    artists.forEach(artist => {
      worksheet.addRow({
        id: artist.id,
        name: artist.name,
        location: artist.location || 'N/A',
        style: artist.style || 'N/A',
        email: artist.email || 'N/A',
        phone: artist.phone || 'N/A',
        instagram: artist.instagram || 'N/A',
        facebook: artist.facebook || 'N/A',
        website: artist.website || 'N/A',
        artwork_count: artist.artwork_count || 0,
        created_at: new Date(artist.created_at).toLocaleString()
      });
    });

    // Borders
    worksheet.eachRow(row => {
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    console.log('✅ Artists Excel generated');
    return buffer;
  } catch (error) {
    console.error('❌ Error generating artists Excel:', error);
    throw error;
  }
}

// Generate Excel for Feedback
async function generateFeedbackExcel(feedbackData) {
  try {
    console.log(`📊 Generating Excel for ${feedbackData.length} feedback records...`);
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Customer Feedback');

    // Columns
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Customer Name', key: 'customer_name', width: 25 },
      { header: 'Email', key: 'customer_email', width: 30 },
      { header: 'Phone', key: 'customer_phone', width: 15 },
      { header: 'Subject', key: 'subject', width: 30 },
      { header: 'Rating', key: 'rating', width: 10 },
      { header: 'Message', key: 'message', width: 50 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Submitted', key: 'created_at', width: 20 }
    ];

    // Header styling
    worksheet.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF14B8A6' }
    };

    if (!feedbackData || feedbackData.length === 0) {
      worksheet.addRow({
        id: 'No data',
        customer_name: 'No feedback submitted yet',
        customer_email: '-',
        customer_phone: '-',
        subject: '-',
        rating: '-',
        message: '-',
        status: '-',
        created_at: '-'
      });
    } else {
      feedbackData.forEach(feedback => {
        worksheet.addRow({
          id: feedback.id,
          customer_name: feedback.customer_name,
          customer_email: feedback.customer_email,
          customer_phone: feedback.customer_phone || 'N/A',
          subject: feedback.subject,
          rating: feedback.rating,
          message: feedback.message,
          status: feedback.status,
          created_at: new Date(feedback.created_at).toLocaleString()
        });
      });

      // Color-code ratings
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
          } else if (rating <= 2) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEF4444' } };
            cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
          }
        }
      });

      // Color-code status
      worksheet.getColumn('status').eachCell((cell, rowNumber) => {
        if (rowNumber > 1) {
          if (cell.value === 'Resolved') {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4EDDA' } };
            cell.font = { color: { argb: 'FF155724' } };
          } else if (cell.value === 'Pending') {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
            cell.font = { color: { argb: 'FF856404' } };
          } else if (cell.value === 'Reviewed') {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3F2FD' } };
            cell.font = { color: { argb: 'FF0369A1' } };
          }
        }
      });
    }

    // Add borders
    worksheet.eachRow((row) => {
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Add summary statistics
    if (feedbackData && feedbackData.length > 0) {
      const summaryRow = worksheet.rowCount + 2;
      
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
    }

    const buffer = await workbook.xlsx.writeBuffer();
    console.log('✅ Feedback Excel generated');
    return buffer;
  } catch (error) {
    console.error('❌ Error generating feedback Excel:', error);
    throw error;
  }
}

module.exports = {
  generateArtworkExcel,
  generateOrderExcel,
  generateArtistsExcel,
  generateFeedbackExcel
};