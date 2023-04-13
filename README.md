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
# for default setting, just run microfs
$ microfs

# user specific setting
$ DB_USER=microfs DB_PASSWORD='your_password' DB_NAME=microfs STORAGE_PATH=/data/microfs/files microfs  
```
## HowTo
```shell
# first, request url for file loading
$ curl -X POST -H "Content-Type: application/json" -d '{"serviceId" : "test",
  "fileName": "file.txt",
  "validDays": 30}'
# response ==>
{
  "code": "OK",
  "data": {
    "url": "http://localhost:9002/microfs/v1/file/742a866bf32241efa6048c73e0827433"
  }
}

# upload file
$ curl -X POST -F 'file=@/path/to/file' http://localhost:9002/microfs/v1/file/742a866bf32241efa6048c73e0827433

# download file
$ wget http://localhost:9002/microfs/v1/file/742a866bf32241efa6048c73e0827433
```


