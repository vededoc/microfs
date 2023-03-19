const cluster = require('node:cluster')
const workerId = cluster.isPrimary ? 'M' : cluster.worker.id.toString()

const logger = require('tracer').console(
    {
        // format: '{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})',
        format: process.env.NODE_ENV!=='production' ? "{{timestamp}} <{{title}}> [{{file}}:{{line}}]"+ '<'+ workerId+'> '+"{{message}}"
          : "{{timestamp}} <{{title}}> "+ '<'+ workerId+'> '+"{{message}}",
        dateformat: 'HH:MM:ss.L'
    }
)


export function SetLogLevel(level) {
    require('tracer').setLevel(level)
}


function getInstanceId() {
    return process.env['scsWorkerId'] ?? 'M'
}
export default logger;