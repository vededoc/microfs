
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
    "serviceId" varchar not null,
    "fileId" varchar not null ,
    "filePath" varchar,
    "originalName" varchar,
    "registerDate" timestamptz,
    "status" int,
    "expireDate" timestamptz,
    constraint file_record_pk primary key ("fileId", "serviceId")
);
