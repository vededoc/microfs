import Cfg from "../def";
import gPgDb from "./PgDbClient";
import gMariaDb from "./MariaClient";

export function getDb() {
    if(Cfg.dbBrand == 'pg') {
        return gPgDb
    } else if(Cfg.dbBrand == 'mariadb') {
        return gMariaDb
    } else {
        return null
    }
}