const formatLocation = (loc) => {
    if (!loc) return loc;
    return loc.replace(/ - ([a-zA-Z]+)$/, (match, code) => ` - ${code.toUpperCase()}`);
};

export function getBookingConfirmationEmail(booking) {
    const p = booking.passenger_details;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 16px; color: #333; margin-bottom: 20px; }
        .message { font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 30px; }
        .route { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0; }
        .route-cities { font-size: 18px; font-weight: 700; margin: 10px 0; }
        .booking-card { background: #f8f9fa; border-radius: 12px; padding: 25px; margin: 20px 0; border-left: 4px solid #667eea; }
        .booking-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e9ecef; }
        .booking-row:last-child { border-bottom: none; }
        .booking-label { font-weight: 600; color: #495057; font-size: 13px; }
        .booking-value { color: #212529; font-size: 13px; text-align: right; }
        .amount { background: #d4edda; color: #155724; padding: 15px; border-radius: 8px; text-align: center; font-size: 18px; font-weight: 700; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #6c757d; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✈️ Booking Confirmed!</h1>
        </div>
        
        <div class="content">
            <div class="greeting">Dear ${p.firstName} ${p.lastName},</div>
            <div class="message">Thank you for choosing Dummy Ticket! Your booking has been successfully confirmed.</div>
            
            <div class="route">
                <div style="font-size: 12px; opacity: 0.9; margin-bottom: 10px;">Your Flight Route</div>
                <div class="route-cities">
                    <div style="margin-bottom: 5px;">${formatLocation(p.departureCity)}</div>
                    <div style="margin: 8px 0; font-size: 20px; opacity: 0.7;">${p.returnDate ? '⇄' : '↓'}</div>
                    <div style="margin-top: 5px;">${formatLocation(p.arrivalCity)}</div>
                </div>
                ${p.returnDate ? '<div style="font-size: 11px; opacity: 0.8; margin-top: 10px;">Round Trip</div>' : ''}
            </div>
            
            <div class="booking-card">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr style="border-bottom: 1px solid #e9ecef;">
                        <td style="padding: 12px 0; font-weight: 600; color: #495057; font-size: 13px;">Booking ID</td>
                        <td style="padding: 12px 0; color: #212529; font-size: 13px; text-align: right;">${booking.id}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e9ecef;">
                        <td style="padding: 12px 0; font-weight: 600; color: #495057; font-size: 13px;">Passenger</td>
                        <td style="padding: 12px 0; color: #212529; font-size: 13px; text-align: right;">${p.firstName} ${p.lastName}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e9ecef;">
                        <td style="padding: 12px 0; font-weight: 600; color: #495057; font-size: 13px;">Email</td>
                        <td style="padding: 12px 0; color: #212529; font-size: 13px; text-align: right;">${p.deliveryEmail || p.email}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e9ecef;">
                        <td style="padding: 12px 0; font-weight: 600; color: #495057; font-size: 13px;">Departure</td>
                        <td style="padding: 12px 0; color: #212529; font-size: 13px; text-align: right;">${new Date(p.departureDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                    </tr>
                    ${p.returnDate ? `
                    <tr style="border-bottom: 1px solid #e9ecef;">
                        <td style="padding: 12px 0; font-weight: 600; color: #495057; font-size: 13px;">Return</td>
                        <td style="padding: 12px 0; color: #212529; font-size: 13px; text-align: right;">${new Date(p.returnDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                    </tr>` : ''}
                    <tr>
                        <td style="padding: 12px 0; font-weight: 600; color: #495057; font-size: 13px;">Service Type</td>
                        <td style="padding: 12px 0; color: #1e40af; font-size: 13px; text-align: right; font-weight: 700;">${booking.service_plan_name || booking.type || 'Standard Ticket'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; font-weight: 600; color: #495057; font-size: 13px;">Class</td>
                        <td style="padding: 12px 0; color: #212529; font-size: 13px; text-align: right;">
                            ${(p.travelClass || 'Economy').replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                        </td>
                    </tr>
                </table>
            </div>

            <div class="amount">Amount Paid: ${booking.currency} ${Number(booking.amount).toFixed(2)}</div>
            
            <div class="message">Our team will process your ticket and send it to you within 24 hours.</div>
        </div>
        
        <div class="footer">
            <strong>Need help?</strong><br>
            Contact us at team@comm.getdummytickets.co
        </div>
    </div>
</body>
</html>`;
}

export function getWelcomeEmail(user) {
    const firstName = user.first_name || 'there';
    const appName = process.env.APP_NAME || 'Dummy Ticket';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 16px; color: #333; margin-bottom: 20px; }
        .message { font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 30px; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white!important; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 700; margin: 20px 0; }
        .features { background: #f8f9fa; border-radius: 12px; padding: 25px; margin: 20px 0; }
        .feature-item { display: flex; align-items: center; margin-bottom: 15px; color: #495057; font-size: 13px; }
        .feature-icon { margin-right: 12px; font-size: 18px; }
        .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #6c757d; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to ${appName}! 🌟</h1>
        </div>
        
        <div class="content">
            <div class="greeting">Hi ${firstName},</div>
            <div class="message">We're thrilled to have you join our community! Your account has been successfully created. You can now access all our premium travel services and manage your bookings with ease.</div>
            
            <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || '#'}/dashboard" class="button">Go to My Dashboard</a>
            </div>

            <div class="features">
                <div style="font-weight: 600; color: #333; margin-bottom: 15px;">What you can do now:</div>
                <div class="feature-item">
                    <span class="feature-icon">✈️</span>
                    <span>Book dummy tickets for visa applications</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">🏨</span>
                    <span>Reserve hotels for proof of accommodation</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">📊</span>
                    <span>Track and manage all your bookings in one place</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">🛡️</span>
                    <span>Update your profile and security settings</span>
                </div>
            </div>
            
            <div class="message">If you have any questions, our support team is always here to help you.</div>
        </div>
        
        <div class="footer">
            <strong>Need help?</strong><br>
            Contact us at team@comm.getdummytickets.co
        </div>
    </div>
</body>
</html>`;
}

export function getAdminNewUserNotificationEmail(user) {
    const appName = process.env.APP_NAME || 'Dummy Ticket';
    const registrationDate = new Date().toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'long'
    });

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; font-size: 14px; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
        .header { border-bottom: 2px solid #667eea; padding-bottom: 10px; margin-bottom: 20px; }
        .info-table { width: 100%; border-collapse: collapse; }
        .info-table th { text-align: left; padding: 10px; background: #f8f9fa; border-bottom: 1px solid #eee; width: 30%; font-size: 13px; }
        .info-table td { padding: 10px; border-bottom: 1px solid #eee; font-size: 13px; }
        .footer { margin-top: 20px; font-size: 11px; color: #666; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="margin: 0; color: #667eea; font-size: 20px;">New User Registration</h2>
        </div>
        <p>A new user has just registered on <strong>${appName}</strong>.</p>
        
        <table class="info-table">
            <tr>
                <th>User Name</th>
                <td>${user.first_name} ${user.last_name}</td>
            </tr>
            <tr>
                <th>Email Address</th>
                <td>${user.email}</td>
            </tr>
            <tr>
                <th>Role</th>
                <td>${user.role || 'user'}</td>
            </tr>
            <tr>
                <th>Registration Date</th>
                <td>${registrationDate}</td>
            </tr>
            <tr>
                <th>Nationality</th>
                <td>${user.nationality || 'N/A'}</td>
            </tr>
        </table>
        
        <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || '#'}/admin/customers" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 13px;">View in Admin Panel</a>
        </div>
        
        <div class="footer">
            This is an automated notification from ${appName}
        </div>
    </div>
</body>
</html>`;
}

export function getAdminBookingNotificationEmail(booking) {
    const p = booking.passenger_details;
    const appName = process.env.APP_NAME || 'Dummy Ticket';
    const bookingDate = new Date().toLocaleString('en-US');
    const serviceType = booking.service_plan_name || booking.type || 'Standard Ticket';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
        .header { border-bottom: 2px solid #764ba2; padding-bottom: 10px; margin-bottom: 20px; }
        .info-table { width: 100%; border-collapse: collapse; }
        .info-table th { text-align: left; padding: 12px; background: #f8f9fa; border-bottom: 1px solid #eee; width: 35%; color: #444; font-size: 13px; }
        .info-table td { padding: 12px; border-bottom: 1px solid #eee; font-size: 13px; color: #212529; }
        .status-badge { background: #d4edda; color: #155724; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
        .footer { margin-top: 20px; font-size: 11px; color: #666; text-align: center; }
        .btn-container { text-align: center; margin-top: 30px; }
        .btn { background: #764ba2; color: white !important; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="margin: 0; color: #764ba2;">New Booking Received</h2>
        </div>
        <p style="font-size: 14px;">A new booking has been completed on <strong>${appName}</strong>.</p>
        
        <table class="info-table">
            <tr>
                <th>Booking ID</th>
                <td><strong>${booking.id}</strong></td>
            </tr>
            <tr>
                <th>Status</th>
                <td><span class="status-badge">${booking.status || 'PAID'}</span></td>
            </tr>
            <tr>
                <th>Amount</th>
                <td><strong>${booking.currency} ${Number(booking.amount).toFixed(2)}</strong></td>
            </tr>
            <tr>
                <th>Passenger Name</th>
                <td>${p.firstName} ${p.lastName}</td>
            </tr>
            <tr>
                <th>Email</th>
                <td><a href="mailto:${p.email}" style="color: #667eea; text-decoration: none;">${p.email}</a></td>
            </tr>
            <tr>
                <th>Phone</th>
                <td>${p.whatsappNumber || p.phone || 'N/A'}</td>
            </tr>
            <tr>
                <th>Route</th>
                <td>${formatLocation(p.departureCity)} ${p.returnDate ? '⇄' : '→'} ${formatLocation(p.arrivalCity)}</td>
            </tr>
            <tr>
                <th>Departure Date</th>
                <td>${p.departureDate}</td>
            </tr>
            ${p.returnDate ? `
            <tr>
                <th>Return Date</th>
                <td>${p.returnDate}</td>
            </tr>` : ''}
            <tr>
                <th>Service Type</th>
                <td style="color: #764ba2; font-weight: bold;">${serviceType}</td>
            </tr>
            <tr>
                <th>Booking Date</th>
                <td>${bookingDate}</td>
            </tr>
        </table>
        
        <div class="btn-container">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || '#'}/admin/orders" class="btn">Manage Booking in Admin Panel</a>
        </div>
        
        <div class="footer">
            This is an automated notification from ${appName}
        </div>
    </div>
</body>
</html>`;
}

export function getPasswordChangedEmail(user) {
    const firstName = user.first_name || 'there';
    const appName = process.env.APP_NAME || 'Dummy Ticket';
    const date = new Date().toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'short'
    });

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 22px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 16px; color: #333; margin-bottom: 20px; }
        .message { font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 30px; }
        .alert-box { background-color: #fff3cd; color: #856404; border: 1px solid #ffeeba; border-radius: 8px; padding: 15px; margin-bottom: 20px; font-size: 13px; }
        .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #6c757d; font-size: 12px; }
        .btn { display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Security Update</h1>
        </div>
        
        <div class="content">
            <div class="greeting">Hi ${firstName},</div>
            <div class="message">
                This email is to confirm that the password for your <strong>${appName}</strong> account was recently changed.
            </div>
            
            <div style="margin-bottom: 20px; font-size: 13px; color: #555;">
                <strong>Date & Time:</strong> ${date}
            </div>

            <div class="alert-box">
                <strong>Did not request this change?</strong><br>
                If you did not change your password, please contact our support team immediately to secure your account.
            </div>
            
            <div style="text-align: center;">
                <a href="mailto:team@comm.getdummytickets.co" class="btn">Contact Support</a>
            </div>
        </div>
        
        <div class="footer">
            <strong>Need help?</strong><br>
            Contact us at team@comm.getdummytickets.co
        </div>
    </div>
</body>
</html>`;
}
