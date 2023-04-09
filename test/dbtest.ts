import {Pool} from "pg";
import assert = require("assert");

(async ()=>{
    const pool = new Pool(
        {host: 'localhost', user: 'microfs', password:'New1234!@', database: 'microfs'}
    )
    const res = await pool.query('select * from file_record')
    // console.info(res.rows)
    const b = BigInt('1n')
    //@ts-ignore
    assert( b == 1)
    for(const r of res.rows) {
        if(r.rid < 3) {
            console.info(r)
        }
    }
    // console.info(typeof res.rows[0].rid)
})()