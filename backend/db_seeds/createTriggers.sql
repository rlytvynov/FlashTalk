CREATE OR REPLACE FUNCTION check_user_uniqueness()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS ( SELECT 1 FROM users WHERE username = NEW.username OR email = NEW.email ) THEN
        RAISE EXCEPTION 'User with this username or email already exists.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_check_user_uniqueness
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION check_user_uniqueness();

CREATE OR REPLACE FUNCTION check_channel_uniques_per_admin()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM channels
        WHERE name = NEW.name
          AND adminId = NEW.adminId
    ) THEN
        RAISE EXCEPTION 'You have already created a channel with this name.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_check_channel_uniques_per_admin
BEFORE INSERT ON channels
FOR EACH ROW
EXECUTE FUNCTION check_channel_uniques_per_admin();