create table storypoints.sessions
(
    id MEDIUMINT NOT NULL
    AUTO_INCREMENT,
	session_name varchar
    (200) NOT NULL,
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
    has_voted bool default false,
    is_admin bool,
    FOREIGN KEY
        (session_id)
        REFERENCES storypoints.sessions
        (id)
        ON
        DELETE CASCADE,
    PRIMARY KEY (id)
        );
