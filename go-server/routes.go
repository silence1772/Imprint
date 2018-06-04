package main

import "net/http"

type Route struct {
    Name        string
    Method      string
    Pattern     string
    HandlerFunc http.HandlerFunc
}

type Routes []Route

var routes = Routes{
    Route{
        "Index",
        "GET",
        "/",
        Index,
    },
    Route{
        "RecordList",
        "GET",
        "/recordlist",
        RecordList,
    },
    Route{
        "CreateRecord",
        "POST",
        "/createrecord",
        CreateRecord,
    },
    Route{
        "GetRecord",
        "GET",
        "/getrecord",
        GetRecord,
    },
    Route{
        "DeleteRecord",
        "GET",
        "/deleterecord",
        DeleteRecord,
    },
    Route{
        "CreateComment",
        "POST",
        "/createcomment",
        CreateComment,
    },
    Route{
        "CreateStar",
        "POST",
        "/createstar",
        CreateStar,
    },
    Route{
        "CancelStar",
        "POST",
        "/cancelstar",
        CancelStar,
    },
    Route{
        "GetRecordList",
        "GET",
        "/getrecordlist",
        GetRecordList,
    },
    Route{
        "CreateVote",
        "POST",
        "/createvote",
        CreateVote,
    },
    Route{
        "UploadFile",
        "POST",
        "/uploadfile",
        UploadFile,
    },
    Route{
        "DeleteFile",
        "DELETE",
        "/deletefile/{fileDir}/{fileName}",
        DeleteFile,
    },
    Route{
        "Login",
        "POST",
        "/login",
        Login,
    },
}