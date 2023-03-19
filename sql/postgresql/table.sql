
drop table if exists api_log;
create table api_log (
    "calledTime" timestamptz,
    "serviceId" varchar,
    "api" varchar,
    "data" varchar,
    constraint api_log_pk primary key ("calledTime")
);

drop table if exists file_record;
create table file_record (
    "nid" bigserial,
    "serviceId" varchar not null,
    "fileId" varchar not null ,
    "originalName" varchar,
    "registerDate" timestamptz,
    "status" int,
    "expireDate" timestamptz,
    constraint file_record_pk primary key ("fileId", "serviceId")
);
create unique index file_record_idx on file_record("nid");
