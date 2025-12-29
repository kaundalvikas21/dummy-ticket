-- Migration 026: Create Notifications System
-- Creates notifications table and triggers for automatic notification generation

-- 1. Create Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'order', 'payment', 'system', 'contact', 'booking'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT, -- URL to navigate to when clicked
    read BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb, -- Store extra data like IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- 3. RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

-- Users can mark their own notifications as read (update)
CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Admins can view/manage all notifications (optional, but good for debugging)
CREATE POLICY "Admins can view all notifications"
    ON notifications FOR SELECT
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );

-- 4. Helper Function to Get Admin IDs
CREATE OR REPLACE FUNCTION get_admin_user_ids()
RETURNS TABLE (admin_id UUID) AS $$
BEGIN
    -- Select IDs from user_profiles where role is 'admin'
    -- Note: This relies on the 'role' column in user_profiles as per Migration 017
    RETURN QUERY 
    SELECT auth_user_id 
    FROM user_profiles 
    WHERE role = 'admin' AND auth_user_id IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger Functions

-- Trigger: New Booking (Order)
-- Notify User: "Booking Confirmed" (pending status initially)
-- Notify Admins: "New Order Received"
CREATE OR REPLACE FUNCTION handle_new_booking_notification()
RETURNS TRIGGER AS $$
DECLARE
    admin_record RECORD;
    user_name TEXT;
BEGIN
    -- Get User Name for Admin Notification
    SELECT CONCAT(first_name, ' ', last_name) INTO user_name 
    FROM user_profiles 
    WHERE auth_user_id = NEW.user_id;

    -- 1. Notify the User
    INSERT INTO notifications (user_id, type, title, message, link, metadata)
    VALUES (
        NEW.user_id, 
        'booking', 
        'Booking Received', 
        'We have received your booking #' || NEW.id::text, 
        '/user/bookings', 
        jsonb_build_object('booking_id', NEW.id)
    );

    -- 2. Notify All Admins
    FOR admin_record IN SELECT admin_id FROM get_admin_user_ids() LOOP
        INSERT INTO notifications (user_id, type, title, message, link, metadata)
        VALUES (
            admin_record.admin_id,
            'order',
            'New Order Received',
            'New booking from ' || COALESCE(user_name, 'Guest') || ' - $' || NEW.amount,
            '/admin/orders',
            jsonb_build_object('booking_id', NEW.id, 'amount', NEW.amount)
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Booking Status Update (Payment/Completion)
CREATE OR REPLACE FUNCTION handle_booking_update_notification()
RETURNS TRIGGER AS $$
DECLARE
    admin_record RECORD;
    user_name TEXT;
BEGIN
    -- Only trigger if status changed
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    -- Get User Name
    SELECT CONCAT(first_name, ' ', last_name) INTO user_name 
    FROM user_profiles 
    WHERE auth_user_id = NEW.user_id;

    -- Case 1: Payment Successful (Pending -> Paid)
    IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
        -- Notify User
        INSERT INTO notifications (user_id, type, title, message, link, metadata)
        VALUES (
            NEW.user_id, 
            'payment', 
            'Payment Successful', 
            'Your payment of $' || NEW.amount || ' for booking #' || NEW.id::text || ' was successful.', 
            '/user/payments', 
            jsonb_build_object('booking_id', NEW.id)
        );

        -- Notify Admins
        FOR admin_record IN SELECT admin_id FROM get_admin_user_ids() LOOP
            INSERT INTO notifications (user_id, type, title, message, link, metadata)
            VALUES (
                admin_record.admin_id,
                'payment',
                'Payment Received',
                'Payment of $' || NEW.amount || ' received from ' || COALESCE(user_name, 'User'),
                '/admin/orders',
                jsonb_build_object('booking_id', NEW.id)
            );
        END LOOP;
    END IF;

    -- Case 2: Booking Completed/Documents Ready (Paid -> Completed)
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
         -- Notify User
        INSERT INTO notifications (user_id, type, title, message, link, metadata)
        VALUES (
            NEW.user_id, 
            'document', 
            'Documents Ready', 
            'Your travel documents for booking #' || NEW.id::text || ' are ready for download.', 
            '/user/documents', 
            jsonb_build_object('booking_id', NEW.id)
        );
    END IF;
    
    -- Case 3: Booking Cancelled
     IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
         -- Notify User
        INSERT INTO notifications (user_id, type, title, message, link, metadata)
        VALUES (
            NEW.user_id, 
            'booking', 
            'Booking Cancelled', 
            'Your booking #' || NEW.id::text || ' has been cancelled.', 
            '/user/bookings', 
            jsonb_build_object('booking_id', NEW.id)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: New Contact Submission
-- Notify Admins Only
CREATE OR REPLACE FUNCTION handle_new_contact_notification()
RETURNS TRIGGER AS $$
DECLARE
    admin_record RECORD;
BEGIN
    FOR admin_record IN SELECT admin_id FROM get_admin_user_ids() LOOP
        INSERT INTO notifications (user_id, type, title, message, link, metadata)
        VALUES (
            admin_record.admin_id,
            'contact',
            'New Contact Submission',
            'Subject: ' || NEW.subject || ' from ' || NEW.name,
            '/admin/logs/contact-submissions',
            jsonb_build_object('submission_id', NEW.id)
        );
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: New User Registration
-- Notify Admins Only
CREATE OR REPLACE FUNCTION handle_new_user_notification()
RETURNS TRIGGER AS $$
DECLARE
    admin_record RECORD;
BEGIN
    -- Only notify for regular users, not if an admin is created (avoid loop/spam)
    IF NEW.role = 'user' THEN
        FOR admin_record IN SELECT admin_id FROM get_admin_user_ids() LOOP
            INSERT INTO notifications (user_id, type, title, message, link, metadata)
            VALUES (
                admin_record.admin_id,
                'customer',
                'New Customer Registered',
                'New user registered: ' || NEW.first_name || ' ' || NEW.last_name,
                '/admin/customers',
                jsonb_build_object('user_profile_id', NEW.id)
            );
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Attach Triggers

-- Bookings Triggers
DROP TRIGGER IF EXISTS trigger_notify_on_new_booking ON bookings;
CREATE TRIGGER trigger_notify_on_new_booking
    AFTER INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_booking_notification();

DROP TRIGGER IF EXISTS trigger_notify_on_booking_update ON bookings;
CREATE TRIGGER trigger_notify_on_booking_update
    AFTER UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION handle_booking_update_notification();

-- Contact Submissions Trigger
DROP TRIGGER IF EXISTS trigger_notify_on_new_contact ON contact_submissions;
CREATE TRIGGER trigger_notify_on_new_contact
    AFTER INSERT ON contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_contact_notification();

-- User Profiles Trigger
DROP TRIGGER IF EXISTS trigger_notify_on_new_user ON user_profiles;
CREATE TRIGGER trigger_notify_on_new_user
    AFTER INSERT ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user_notification();
-- 7. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
