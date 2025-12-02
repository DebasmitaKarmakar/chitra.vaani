const nodemailer = require('nodemailer');

// Create transporter with Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD // Gmail App Password, NOT regular password
  }
});

// Send order confirmation to customer
async function sendOrderConfirmation(orderData) {
  const { 
    orderId, 
    customerName, 
    customerEmail, 
    orderType, 
    orderDetails 
  } = orderData;

  const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #8b7355; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f7f5; padding: 20px; margin: 20px 0; }
        .order-details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #8b7355; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        .button { display: inline-block; padding: 12px 24px; background: #8b7355; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ChitraVaani</h1>
          <p>Order Confirmation</p>
        </div>
        
        <div class="content">
          <h2>Thank You, ${customerName}!</h2>
          <p>Your order has been received and is being processed.</p>
          
          <div class="order-details">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> #${orderId}</p>
            <p><strong>Order Type:</strong> ${orderType.toUpperCase()}</p>
            <p><strong>Status:</strong> Pending</p>
            ${orderType === 'regular' ? `<p><strong>Artwork:</strong> ${orderDetails.artwork_title || 'N/A'}</p>` : ''}
            ${orderType === 'custom' ? `<p><strong>Your Idea:</strong> ${orderDetails.idea?.substring(0, 100)}...</p>` : ''}
            ${orderType === 'bulk' ? `<p><strong>Organization:</strong> ${orderDetails.orgName}</p><p><strong>Quantity:</strong> ${orderDetails.quantity}</p>` : ''}
          </div>
          
          <p>We will contact you within 24 hours to confirm details and discuss next steps.</p>
          
          <center>
            <a href="https://chitravaani.vercel.app/contact" class="button">Contact Us</a>
          </center>
        </div>
        
        <div class="footer">
          <p>ChitraVaani - Handmade Art Studio</p>
          <p>Email: ${process.env.EMAIL_USER} | Phone: +91-9436357001</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"ChitraVaani" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `Order Confirmation - ChitraVaani #${orderId}`,
      html: emailHTML
    });
    console.log(` Order confirmation sent to ${customerEmail}`);
    return { success: true };
  } catch (error) {
    console.error(' Failed to send confirmation email:', error);
    return { success: false, error: error.message };
  }
}

// Notify admin about new order
async function notifyAdminNewOrder(orderData) {
  const { 
    orderId, 
    customerName, 
    customerEmail,
    customerPhone,
    orderType, 
    orderDetails 
  } = orderData;

  const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #d32f2f; color: white; padding: 20px; text-align: center; }
        .content { background: #fff3e0; padding: 20px; margin: 20px 0; }
        .order-details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #d32f2f; }
        .button { display: inline-block; padding: 12px 24px; background: #d32f2f; color: white; text-decoration: none; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Order Alert!</h1>
          <p>ChitraVaani Admin</p>
        </div>
        
        <div class="content">
          <h2>New ${orderType.toUpperCase()} Order Received</h2>
          
          <div class="order-details">
            <h3>Order #${orderId}</h3>
            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Email:</strong> ${customerEmail}</p>
            <p><strong>Phone:</strong> ${customerPhone || 'Not provided'}</p>
            <p><strong>Order Type:</strong> ${orderType}</p>
            
            ${orderType === 'regular' ? `
              <p><strong>Artwork:</strong> ${orderDetails.artwork_title}</p>
              <p><strong>Size:</strong> ${orderDetails.size}</p>
              <p><strong>Notes:</strong> ${orderDetails.notes || 'None'}</p>
            ` : ''}
            
            ${orderType === 'custom' ? `
              <p><strong>Idea:</strong> ${orderDetails.idea}</p>
              <p><strong>Medium:</strong> ${orderDetails.medium || 'Any'}</p>
              <p><strong>Size:</strong> ${orderDetails.size || 'Flexible'}</p>
              <p><strong>Budget:</strong> ${orderDetails.budget || 'Not specified'}</p>
            ` : ''}
            
            ${orderType === 'bulk' ? `
              <p><strong>Organization:</strong> ${orderDetails.orgName}</p>
              <p><strong>Item Type:</strong> ${orderDetails.itemType}</p>
              <p><strong>Quantity:</strong> ${orderDetails.quantity}</p>
              <p><strong>Details:</strong> ${orderDetails.details}</p>
              <p><strong>Deadline:</strong> ${orderDetails.deadline || 'Not specified'}</p>
            ` : ''}
          </div>
          
          <center>
            <a href="https://chitravaani.vercel.app/admin" class="button">View in Dashboard</a>
          </center>
          
          <p><strong>Action Required:</strong> Please contact the customer within 24 hours.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"ChitraVaani Orders" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: ` New ${orderType.toUpperCase()} Order #${orderId}`,
      html: emailHTML
    });
    console.log(' Admin notification sent');
    return { success: true };
  } catch (error) {
    console.error(' Failed to send admin notification:', error);
    return { success: false, error: error.message };
  }
}

// Send order status update
async function sendOrderStatusUpdate(orderData) {
  const { 
    orderId, 
    customerName, 
    customerEmail, 
    newStatus,
    orderType 
  } = orderData;

  let statusMessage = '';
  let statusColor = '#8b7355';

  if (newStatus === 'Completed') {
    statusMessage = 'Your order has been completed and is ready!';
    statusColor = '#4caf50';
  } else if (newStatus === 'Cancelled') {
    statusMessage = 'Your order has been cancelled. Please contact us for more information.';
    statusColor = '#f44336';
  }

  const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${statusColor}; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f7f5; padding: 20px; margin: 20px 0; }
        .status-badge { display: inline-block; padding: 10px 20px; background: ${statusColor}; color: white; border-radius: 20px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Status Update</h1>
        </div>
        
        <div class="content">
          <h2>Hello ${customerName},</h2>
          <p>${statusMessage}</p>
          
          <p><strong>Order ID:</strong> #${orderId}</p>
          <p><strong>New Status:</strong> <span class="status-badge">${newStatus}</span></p>
          
          <p>If you have any questions, please contact us:</p>
          <p>Email: ${process.env.EMAIL_USER}<br>Phone: +91-9436357001</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"ChitraVaani" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `Order #${orderId} Status Update - ${newStatus}`,
      html: emailHTML
    });
    console.log(` Status update sent to ${customerEmail}`);
    return { success: true };
  } catch (error) {
    console.error(' Failed to send status update:', error);
    return { success: false, error: error.message };
  }
}

// Send feedback confirmation
async function sendFeedbackConfirmation(feedbackData) {
  const { customerName, customerEmail, rating, subject } = feedbackData;

  const stars = '⭐'.repeat(rating);

  const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0ea5e9; color: white; padding: 20px; text-align: center; }
        .content { background: #f0f9ff; padding: 20px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Thank You for Your Feedback!</h1>
        </div>
        
        <div class="content">
          <h2>Hello ${customerName},</h2>
          <p>We've received your feedback and truly appreciate your input.</p>
          
          <p><strong>Your Rating:</strong> ${stars} (${rating}/5)</p>
          <p><strong>Subject:</strong> ${subject}</p>
          
          <p>Your feedback helps us improve our services and artwork quality. We'll review your comments and get back to you if needed.</p>
          
          <p>Thank you for being a valued customer!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"ChitraVaani" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: 'Thank You for Your Feedback - ChitraVaani',
      html: emailHTML
    });
    console.log(` Feedback confirmation sent to ${customerEmail}`);
    return { success: true };
  } catch (error) {
    console.error(' Failed to send feedback confirmation:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendOrderConfirmation,
  notifyAdminNewOrder,
  sendOrderStatusUpdate,
  sendFeedbackConfirmation
};