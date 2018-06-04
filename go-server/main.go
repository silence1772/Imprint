package main

import (
        "log"
        "net/http"
)

func main() {

    router := NewRouter()

    log.Fatal(http.ListenAndServeTLS(":443", "1_api.silence1772.cn_bundle.crt", "2_api.silence1772.cn.key", router))
    //log.Fatal(http.ListenAndServe(":8080", router))
}

