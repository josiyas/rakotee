-- Trigger to update updated_at on change
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_users before update on users for each row execute function set_updated_at();
create trigger set_updated_at_products before update on products for each row execute function set_updated_at();
create trigger set_updated_at_orders before update on orders for each row execute function set_updated_at();
