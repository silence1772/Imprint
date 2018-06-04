package main

import (
    "net/http"

    "github.com/gorilla/mux"
)

func NewRouter() *mux.Router {
    router := mux.NewRouter().StrictSlash(true)
    for _, route := range routes {
        var handler http.Handler
        handler = route.HandlerFunc
        handler = Logger(handler, route.Name)

        router.
            Methods(route.Method).
            Path(route.Pattern).
            Name(route.Name).
            Handler(handler)

    }
    // 新增静态文件处理
    router.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("/home/ubuntu/wxapp_src"))))
    return router
}