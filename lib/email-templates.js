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
        .header h1 { color: #fff; margin: 0; font-size: 28px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
        .message { font-size: 16px; color: #666; line-height: 1.6; margin-bottom: 30px; }
        .route { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0; }
        .route-cities { font-size: 24px; font-weight: 700; margin: 10px 0; }
        .booking-card { background: #f8f9fa; border-radius: 12px; padding: 25px; margin: 20px 0; border-left: 4px solid #667eea; }
        .booking-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e9ecef; }
        .booking-row:last-child { border-bottom: none; }
        .booking-label { font-weight: 600; color: #495057; font-size: 14px; }
        .booking-value { color: #212529; font-size: 14px; text-align: right; }
        .amount { background: #d4edda; color: #155724; padding: 15px; border-radius: 8px; text-align: center; font-size: 20px; font-weight: 700; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #6c757d; font-size: 14px; }
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
                <div style="font-size: 14px; opacity: 0.9; margin-bottom: 10px;">Your Flight Route</div>
                <div class="route-cities">${p.departureCity} ${p.returnDate ? '⇄' : '→'} ${p.arrivalCity}</div>
                ${p.returnDate ? '<div style="font-size: 12px; opacity: 0.8; margin-top: 10px;">Round Trip</div>' : ''}
            </div>
            
            <div class="booking-card">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr style="border-bottom: 1px solid #e9ecef;">
                        <td style="padding: 12px 0; font-weight: 600; color: #495057; font-size: 14px;">Booking ID</td>
                        <td style="padding: 12px 0; color: #212529; font-size: 14px; text-align: right;">${booking.id}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e9ecef;">
                        <td style="padding: 12px 0; font-weight: 600; color: #495057; font-size: 14px;">Passenger</td>
                        <td style="padding: 12px 0; color: #212529; font-size: 14px; text-align: right;">${p.firstName} ${p.lastName}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e9ecef;">
                        <td style="padding: 12px 0; font-weight: 600; color: #495057; font-size: 14px;">Departure</td>
                        <td style="padding: 12px 0; color: #212529; font-size: 14px; text-align: right;">${new Date(p.departureDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                    </tr>
                    ${p.returnDate ? `
                    <tr style="border-bottom: 1px solid #e9ecef;">
                        <td style="padding: 12px 0; font-weight: 600; color: #495057; font-size: 14px;">Return</td>
                        <td style="padding: 12px 0; color: #212529; font-size: 14px; text-align: right;">${new Date(p.returnDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                    </tr>` : ''}
                    <tr>
                        <td style="padding: 12px 0; font-weight: 600; color: #495057; font-size: 14px;">Class</td>
                        <td style="padding: 12px 0; color: #212529; font-size: 14px; text-align: right;">
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
