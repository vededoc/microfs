export interface BaseResp {
    code: string
    msg?: string
    data?: any
}

export interface CreateUrlReq {
    serviceId: string
    validDays: number
    fileName?: string
}
export interface CreateUrlResp {
    url: string
}

export interface FileReq {
    serviceId: string
    fileId: string
}