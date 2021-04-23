ALTER DATABASE storypoints CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin;

create table sessions
(
    id MEDIUMINT NOT NULL
    AUTO_INCREMENT,
	session_name varchar
    (200) NOT NULL,
    points_visible boolean default false NOT NULL,
    PRIMARY KEY
    (id)
);

create table participant
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
    FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE,

    PRIMARY KEY (id)
);

ALTER TABLE sessions CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
ALTER TABLE participant CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;

alter table participant add column has_revoted boolean;
alter table participant add column login_id varchar(255);
alter table participant add column login_email varchar(255);

create table user (
    first_name varchar(100),
    last_name varchar(100),
    provider_id varchar(100) UNIQUE ,
    name varchar(200),
    photo_url varchar(200),
    provider varchar(100),
    date_joined DATETIME,
    updated DATETIME,
    PRIMARY KEY (provider_id)
);


ALTER TABLE sessions
ADD COLUMN last_active date;

create table celebration
(
    session_id MEDIUMINT NOT NULL UNIQUE ,
    count BIGINT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
);

create table session_badge
(
    id MEDIUMINT NOT NULL AUTO_INCREMENT,
    name varchar(50),
    value varchar(255),
    PRIMARY KEY (id)
);

create table session_earned_badge
(
    id MEDIUMINT NOT NULL,
    badge_id MEDIUMINT NOT NULL,
    session_id MEDIUMINT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES session_badge (id) ON DELETE CASCADE,
    PRIMARY KEY (id)
);

insert into session_badge (id, name, value) values (1, 'NEW_SESSION', 'New Since Badges Became a Thing')
