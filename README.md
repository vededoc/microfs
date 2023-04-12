# micro file server
simple file server made with nodejs  
microfs doesn't support GUI, just provides API for uploading/download a file.

## Installation
1. setup database
2. install microfs

### setup database
Currently, microfs supports only postgresql.  
```sql
# create database and user
$ psql -h localhost -U postgres -p 
postgres=# create database microfs;
postgres=# create user microfs with password 'db_password';
postgres=# grant all privileges on database microfs to microfs;

...

# create tables
-- connect with microfs account 
$ psql -h localhost -U microfs -p
-- create tables
microfs=> \i sql/postgresql/table.sql    
```

### install microfs
```shell
$ sudo npm i -g @vededoc/microfs
```

### run
```shell
$ DB_USER=microfs  DB_PASSWORD='your_password' DB_NAME=microfs 
```
## HowTo
- POST /createUrl
- Get uploading/downloading url from response




