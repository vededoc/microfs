create table api_log (
    calledTime datetime,
    serviceId varchar(50),
    api varchar(128),
    data varchar(1024),
    constraint api_log_pk primary key (calledTime)
);
create index api_log_idx on api_log(serviceId);

create table file_record (
    rid bigint auto_increment,
    serviceId varchar(50) not null,
    fileId varchar(50) not null ,
    originalName varchar(256),
    registerDate datetime,
    status int,
    expireDate datetime,
    constraint file_record_pk primary key (rid, fileId, serviceId)
);

