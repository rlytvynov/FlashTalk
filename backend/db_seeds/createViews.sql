CREATE VIEW channels_with_members AS
SELECT 
    c.*,
    json_agg(json_build_object('id', u.id, 'username', u.username, 'displayName', u.displayName)) AS members
FROM 
    channels c
LEFT JOIN users_to_channel uc ON c.id = uc.channelId
LEFT JOIN users u ON uc.userId = u.id
GROUP BY c.id;

CREATE VIEW messages_with_authors AS
SELECT 
    m.*, 
    u.displayName AS authorDisplayName
FROM 
    messages m
JOIN users u ON m.authorId = u.id
ORDER BY date DESC;

/*
    SELECT * FROM messages_with_authors
    WHERE channelId = ?
    ORDER BY date DESC
    LIMIT ? OFFSET ?;
*/


CREATE OR REPLACE VIEW user_channels_with_members AS
SELECT
    c.id,
    c.name,
    c.description,
    c.adminId,
    json_agg(
        json_build_object(
            'id', u.id,
            'username', u.username,
            'displayName', u.displayName
        )
    ) AS members
FROM
    channels c
JOIN users_to_channel uc1 ON c.id = uc1.channelId
LEFT JOIN users_to_channel uc2 ON c.id = uc2.channelId
LEFT JOIN users u ON uc2.userId = u.id
GROUP BY c.id;

SELECT * FROM user_channels_with_members
WHERE id IN (
    SELECT channelId FROM users_to_channel WHERE userId = 123
);