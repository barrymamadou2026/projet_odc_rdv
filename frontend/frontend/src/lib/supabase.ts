import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://pyoiesaelrvokqqnfdxd.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImViODVkYzc4LTFiNjUtNGIxOS1hZDgzLWM2NzJmNDVlOWM1MyJ9.eyJwcm9qZWN0SWQiOiJweW9pZXNhZWxydm9rcXFuZmR4ZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzgyNTY1NTQ3LCJleHAiOjIwOTc5MjU1NDcsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.IbJmG0qtMHNhcxOnxS7YZFKKps4W--_DLLSfhJvrBz8';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };