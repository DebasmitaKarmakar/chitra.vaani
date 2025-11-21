const nodemailer = require('nodemailer');

// Validate nodemailer is loaded correctly
if (!nodemailer || typeof nodemailer.createTransport !== 'function') {
  console.error(' Nodemailer not loaded correctly');
  console.error('Run: npm install nodemailer');
  process.exit(1);
}

console.log(' Nodemailer loaded successfully');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ARTIST_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Test email configuration
async function testEmailConnection() {
  try {
    await transporter.verify();
    console.log('Email service is ready to send emails');
    return true;
  } catch (error) {
    console.error(' Email service error:', error.message);
    console.error(' Check your ARTIST_EMAIL and GMAIL_APP_PASSWORD in .env');
    return false;
  }
}

// Send order notification to admin
async function sendOrderNotificationToAdmin(orderData) {
  try {
    const orderDetails = orderData.order_details;
    let detailsHtml = '';

    if (orderData.order_type === 'regular') {
      detailsHtml = `
        <p><strong>Artwork:</strong> ${orderDetails.artwork || 'N/A'}</p>
        <p><strong>Price:</strong> ${orderDetails.price || 'N/A'}</p>
        <p><strong>Size:</strong> ${orderDetails.size || 'Standard'}</p>
        <p><strong>Notes:</strong> ${orderDetails.notes || 'None'}</p>
      `;
    } else if (orderData.order_type === 'custom') {
      detailsHtml = `
        <p><strong>Custom Idea:</strong> ${orderDetails.idea || 'N/A'}</p>
        <p><strong>Medium:</strong> ${orderDetails.medium || 'N/A'}</p>
      `;
    } else if (orderData.order_type === 'bulk') {
      detailsHtml = `
        <p><strong>Organization:</strong> ${orderDetails.orgName || 'N/A'}</p>
        <p><strong>Item Type:</strong> ${orderDetails.itemType || 'N/A'}</p>
        <p><strong>Quantity:</strong> ${orderDetails.quantity || 'N/A'}</p>
        <p><strong>Deadline:</strong> ${orderDetails.deadline || 'N/A'}</p>
      `;
    }

    const mailOptions = {
      from: `Chitra Vaani <${process.env.ARTIST_EMAIL}>`,
      to: process.env.ARTIST_EMAIL,
      subject: `New Order #${orderData.id} - ${orderData.order_type.toUpperCase()}`,
      html: `
        <h2 style="color: #8b7355;">New Order Received!</h2>
        ${detailsHtml}
        <p><strong>Customer:</strong> ${orderData.customer_name}</p>
        <p><strong>Email:</strong> ${orderData.customer_email}</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(' Order notification sent to admin:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email to admin:', error);
    return false;
  }
}

// Send order confirmation to customer
async function sendOrderConfirmationToCustomer(orderData) {
  try {
    const mailOptions = {
      from: `Chitra Vaani <${process.env.ARTIST_EMAIL}>`,
      to: orderData.customer_email,
      subject: `Order Confirmation - Chitra Vaani #${orderData.id}`,
      html: `
        <h2>Thank you for your order, ${orderData.customer_name}!</h2>
        <p>Your order has been received and is being processed.</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(' Order confirmation sent to customer:', info.messageId);
    return true;
  } catch (error) {
    console.error(' Error sending email to customer:', error);
    return false;
  }
}

module.exports = {
  testEmailConnection,
  sendOrderNotificationToAdmin,
  sendOrderConfirmationToCustomer
};
