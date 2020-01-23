ALTER DATABASE storypoints CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

create table storypoints.sessions
(
    id MEDIUMINT NOT NULL
    AUTO_INCREMENT,
	session_name varchar
    (200) NOT NULL,
    points_visible boolean default false NOT NULL,
    PRIMARY KEY
    (id)
);

    create table storypoints.participant
    (
        id MEDIUMINT NOT NULL
        AUTO_INCREMENT,
    session_id MEDIUMINT NOT NULL,
	participant_name varchar
        (200) NOT NULL,
    point varchar
        (100) NOT NULL,
    has_voted bool default false NOT NULL,
    is_admin bool default false NOT NULL,
    FOREIGN KEY
        (session_id)
        REFERENCES storypoints.sessions
        (id)
        ON
        DELETE CASCADE,
    PRIMARY KEY (id)
        );

ALTER TABLE storypoints.sessions CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
ALTER TABLE storypoints.participant CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
