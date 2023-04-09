# micro file server
simple file server made with nodejs  
snfs doesn't support GUI, just provides API for uploading/download a file.

## Installation
1. setup database
2. install microfs

### setup database
Currently, microfs supports only postgresql.  
In psql, create database and user as followings
```sql
create database microfs;
create user microfs with password 'db_password';
grant all privileges on database microfs to microfs;  
```

### run microfs
```shell
$ 
```


## HowTo
- POST /createUrl
- Get uploading/downloading url from response




