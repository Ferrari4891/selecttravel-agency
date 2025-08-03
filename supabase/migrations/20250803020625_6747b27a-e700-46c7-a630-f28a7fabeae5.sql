-- Create admin user function that can be called to set up the admin account
CREATE OR REPLACE FUNCTION public.create_admin_user()
RETURNS void AS $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Note: The actual user creation needs to be done through Supabase Auth API
    -- This function will set admin privileges for the user once they sign up
    
    -- First, try to find existing user with email 'admin@test.com'
    SELECT auth.uid() INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@test.com' 
    LIMIT 1;
    
    -- If user exists, make them admin
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO public.profiles (user_id, display_name, is_admin)
        VALUES (admin_user_id, 'ADMIN', true)
        ON CONFLICT (user_id) 
        DO UPDATE SET is_admin = true, display_name = 'ADMIN';
        
        RAISE NOTICE 'Admin privileges granted to user: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Admin user not found. Please create user with email: admin@test.com first';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Also create a function to manually set admin for any user by email
CREATE OR REPLACE FUNCTION public.set_admin_by_email(user_email TEXT)
RETURNS void AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Find user by email
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = user_email 
    LIMIT 1;
    
    -- If user exists, make them admin
    IF target_user_id IS NOT NULL THEN
        INSERT INTO public.profiles (user_id, display_name, is_admin)
        VALUES (target_user_id, 'ADMIN', true)
        ON CONFLICT (user_id) 
        DO UPDATE SET is_admin = true;
        
        RAISE NOTICE 'Admin privileges granted to user: % (ID: %)', user_email, target_user_id;
    ELSE
        RAISE NOTICE 'User not found with email: %', user_email;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;