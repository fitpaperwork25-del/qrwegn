-- Grant anon role the ability to insert orders and order_items.
-- Required when tables are created via raw SQL rather than the Supabase dashboard.
-- Run once in the Supabase SQL editor for project pzpgjyuvtmjetvpyavnt.

grant usage on schema public to anon, authenticated;

grant select          on businesses      to anon;
grant select          on locations       to anon;
grant select          on menu_categories to anon;
grant select          on menu_items      to anon;
grant select, insert  on orders          to anon;
grant select, insert  on order_items     to anon;
