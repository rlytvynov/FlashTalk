CREATE OR REPLACE FUNCTION create_user (
    _username VARCHAR,
    _email VARCHAR,
    _password TEXT,
    _displayName VARCHAR
) RETURNS TABLE (
    id INTEGER,
    username VARCHAR,
    email VARCHAR,
    displayName VARCHAR
)
AS $$
BEGIN
    RETURN QUERY
    INSERT INTO users (username, email, password, displayName)
    VALUES (_username, _email, _password, _displayName)
    RETURNING users.id, users.username, users.email, users.displayName;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION create_channel(
    _name VARCHAR,
    _description TEXT,
    _adminId INTEGER
) RETURNS TABLE (
    id INTEGER,
    name VARCHAR,
    description TEXT,
    adminId INTEGER,
    members JSON,
    messages JSON
)
AS $$
DECLARE
    new_channel RECORD;
BEGIN
    INSERT INTO channels (name, description, adminId)
    VALUES (_name, _description, _adminId)
    RETURNING channels.id, channels.name, channels.description, channels.adminId INTO new_channel;

    INSERT INTO users_to_channel (userId, channelId)
    VALUES (_adminId, new_channel.id);

    RETURN QUERY SELECT
        new_channel.id,
        new_channel.name,
        new_channel.description,
        new_channel.adminId,
        '[]'::json,
        '[]'::json;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION create_message(
    _channelId INTEGER,
    _authorId INTEGER,
    _data TEXT
) RETURNS TABLE (
    id INTEGER,
    channelId INTEGER,
    authorId INTEGER,
    data TEXT,
    date TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    INSERT INTO messages (channelId, authorId, data)
    VALUES (_channelId, _authorId, _data)
    RETURNING messages.id, messages.channelId, messages.authorId, messages.data, messages.date;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_searched_channel_messages(
    _channel_id INTEGER,
    _search_query TEXT DEFAULT NULL,
    _limit INTEGER DEFAULT 50,
    _offset INTEGER DEFAULT 0
) RETURNS TABLE (
    id INTEGER,
    channelId INTEGER,
    authorId INTEGER,
    authorName VARCHAR(50),
    data TEXT,
    date TIMESTAMP,
    total_count BIGINT
) AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM channels WHERE channels.id = _channel_id) THEN
        RAISE EXCEPTION 'Channel with ID % does not exist', _channel_id;
    END IF;
    RETURN QUERY
    WITH filtered_messages AS (
        SELECT
            m.id,
            m.channelId,
            m.authorId,
            u.displayName,
            m.data,
            m.date,
            COUNT(*) OVER() AS full_count
        FROM
            messages m
        JOIN
            users u ON m.authorId = u.id
        WHERE
            m.channelId = _channel_id
            AND
            m.data ILIKE '%' || _search_query || '%'
        ORDER BY
            m.id ASC
        LIMIT
            _limit
        OFFSET
            _offset
    )
    SELECT
        filtered_messages.id,
        filtered_messages.channelId,
        filtered_messages.authorId,
        filtered_messages.displayName,
        filtered_messages.data,
        filtered_messages.date,
        filtered_messages.full_count
    FROM
        filtered_messages;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION get_user_channels_with_members(
    _userId INTEGER
)
RETURNS TABLE (
    id INTEGER,
    name VARCHAR,
    description TEXT,
    adminId INTEGER,
    messages JSON,
    members JSON
) AS $$
BEGIN
    RETURN QUERY
    WITH
    -- Get last 10 messages for each channel
    channel_messages AS (
        SELECT
            m.channelId,
            json_agg(
                json_build_object(
                    'id', m.id,
                    'data', m.data,
                    'date', m.date,
                    'authorid', u.id,
                    'authorname', u.displayname
                )
                ORDER BY m.id ASC
            ) AS recent_messages
        FROM (
            SELECT
                m.*,
                ROW_NUMBER() OVER (PARTITION BY channelId ORDER BY date DESC) as rn
            FROM messages m
        ) m
        JOIN users u ON m.authorId = u.id
        WHERE m.rn <= 10
        GROUP BY m.channelId
    ),
    -- Get all channel members
    channel_members AS (
        SELECT
            uc.channelId,
            json_agg(
                json_build_object(
                    'id', u.id,
                    'username', u.username,
                    'displayname', u.displayName
                )
            ) AS member_list
        FROM users_to_channel uc
        JOIN users u ON uc.userId = u.id
        GROUP BY uc.channelId
    )
    -- Combine everything
    SELECT
        c.id,
        c.name,
        c.description,
        c.adminId as adminId,
        COALESCE(cm.recent_messages, '[]'::json) AS messages,
        COALESCE(mem.member_list, '[]'::json) AS members
    FROM channels c
    JOIN users_to_channel uc ON c.id = uc.channelId AND uc.userId = _userId
    LEFT JOIN channel_messages cm ON c.id = cm.channelId
    LEFT JOIN channel_members mem ON c.id = mem.channelId;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION add_user_to_channel(
    _userId INTEGER,
    _channelId INTEGER
) RETURNS TABLE (
    id INTEGER,
    userId INTEGER,
    channelId INTEGER
) AS $$
DECLARE
    user_exists BOOLEAN;
    channel_exists BOOLEAN;
    already_member BOOLEAN;
BEGIN
    SELECT EXISTS(SELECT 1 FROM users u WHERE u.id = _userId) INTO user_exists;
    IF NOT user_exists THEN
        RAISE EXCEPTION 'User with ID % does not exist', _userId;
    END IF;

    SELECT EXISTS(SELECT 1 FROM channels c WHERE c.id = _channelId) INTO channel_exists;
    IF NOT channel_exists THEN
        RAISE EXCEPTION 'Channel with ID % does not exist', _channelId;
    END IF;

    SELECT EXISTS(SELECT 1 FROM users_to_channel uc
                 WHERE uc.userId = _userId AND uc.channelId = _channelId) INTO already_member;
    IF already_member THEN
        RAISE NOTICE 'User % is already a member of channel %', _userId, _channelId;
    END IF;

    RETURN QUERY
    INSERT INTO users_to_channel (userId, channelId)
    VALUES (_userId, _channelId)
    RETURNING users_to_channel.id, users_to_channel.userId, users_to_channel.channelId;
END;
$$ LANGUAGE plpgsql;

select * from get_user_channels_with_members(2);
select * from users;
