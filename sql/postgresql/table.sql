create table api_log (
    "calledTime" timestamptz,
    "serviceId" varchar,
    "api" varchar,
    "data" varchar,
    constraint api_log_pk primary key ("calledTime")
);
create index api_log_idx on api_log("serviceId");

create table file_record (
    rid bigserial,
    "serviceId" varchar not null,
    "fileId" varchar not null ,
    "originalName" varchar,
    "registerDate" timestamptz,
    "status" int,
    "expireDate" timestamptz,
    constraint file_record_pk primary key ("fileId", "serviceId")
);
create unique index file_record_idx on file_record("rid");
