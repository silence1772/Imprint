package main

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"net/http"
	"strconv"
	"strings"
	"time"
	"math/rand"
	"github.com/gorilla/mux"
	"gopkg.in/mgo.v2/bson"
)

func Index(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "Welcome!\n")
}

func RecordList(w http.ResponseWriter, r *http.Request) {
	vars := r.URL.Query()
	lon, _ := strconv.ParseFloat(vars["lon"][0], 64)
	lat, _ := strconv.ParseFloat(vars["lat"][0], 64)
	// construct the Response struct
	briefrecordlist := new(BriefRecordList)
	briefrecordlist.Status = 1
	briefrecordlist.Msg = "OK"
	recordsNearby := RepoFindNearbyRecords(lon, lat)
	for _, item := range recordsNearby {
		
		briefrecordlist.Data = append(briefrecordlist.Data, BriefRecordListItem{
			Id: item.Id,
			Lon: item.Lon,
			Lat: item.Lat,
			Avatar: item.Avatar,
			NickName: item.NickName,
			TimeStamp: item.TimeStamp,
			Content: Substr(item.Content, 0, 25),
			ShortCut: item.PicList[0],
			Views: item.Views,
			VoteUps: len(item.VoteUpList),
			VisibleFlag: item.VisibleFlag,
			})
	}
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(briefrecordlist); err != nil {
		panic(err)
	}
}

func Substr(str string, start, length int) string {
    rs := []rune(str)
    rl := len(rs)
    end := 0
        
    if start < 0 {
        start = rl - 1 + start
    }
    end = start + length
    
    if start > end {
        start, end = end, start
    }
    
    if start < 0 {
        start = 0
    }
    if start > rl {
        start = rl
    }
    if end < 0 {
        end = 0
    }
    if end > rl {
        end = rl
    }
    return string(rs[start:end])
}

func GetRecord(w http.ResponseWriter, r *http.Request) {
	vars := r.URL.Query()
	id := vars["id"][0]
	openid := vars["openid"][0]
	record := RepoFindRecord(id)
	comments := RepoFindComments(id)
	record.Comments = comments
	record.HasStared = RepoFindStar(openid, id)
	record.VoteUp = len(record.VoteUpList)
	record.VoteDown = len(record.VoteDownList)
	for _, item := range record.VoteUpList {
		if item == openid {
			record.VoteFlag = 1
			break
		}
	}
	if record.VoteFlag == 0 {
		for _, item := range record.VoteDownList {
			if item == openid {
				record.VoteFlag = -1
				break
			}
		}
	}

	record.VoteUpList = []string{}
	record.VoteDownList = []string{}
	
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(record); err != nil {
		panic(err)
	}
}

func DeleteRecord(w http.ResponseWriter, r *http.Request) {
	vars := r.URL.Query()
	id := vars["id"][0]
	flag := RepoDeleteRecord(id)

	if flag {
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.WriteHeader(http.StatusOK)
	} else {
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.WriteHeader(http.StatusBadRequest)
	}
}

func CreateComment(w http.ResponseWriter, r *http.Request) {
	//mainid := r.PostFormValue("mainid")
	// 若有commentid则为回复评论
	commentid := r.PostFormValue("commentid")

	if commentid == "" {
		var comment CommentItem
		comment.Id = bson.NewObjectId()
		comment.MainId = bson.ObjectIdHex(r.PostFormValue("mainid"))
		comment.OpenId = r.PostFormValue("openid")
		comment.Avatar = r.PostFormValue("avatar")
		comment.NickName = r.PostFormValue("nickname")
		comment.TimeStamp =  strconv.FormatInt(time.Now().Unix(), 10)
		comment.Content = r.PostFormValue("content")
		comment.Count = 1

		temp := RepoCreateComment(comment)
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.WriteHeader(http.StatusCreated)
		if err := json.NewEncoder(w).Encode(temp); err != nil {
			panic(err)
		}
	} else {
		var reply ReplyItem
		reply.Id = bson.NewObjectId()
		reply.From_OpenId = r.PostFormValue("openid")
		reply.From_Avatar = r.PostFormValue("avatar")
		reply.From_NickName = r.PostFormValue("nickname")
		reply.TimeStamp =  strconv.FormatInt(time.Now().Unix(), 10)
		reply.Content = r.PostFormValue("content")

		temp := RepoCreateReply(reply, commentid)
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.WriteHeader(http.StatusCreated)
		if err := json.NewEncoder(w).Encode(temp); err != nil {
			panic(err)
		}
	}
}

func CreateStar(w http.ResponseWriter, r *http.Request) {
	flag := RepoCreateStar(r.PostFormValue("openid"), r.PostFormValue("mainid"))
	if flag {
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.WriteHeader(http.StatusCreated)
	} else {
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.WriteHeader(http.StatusBadRequest)
	}
}

func CancelStar(w http.ResponseWriter, r *http.Request) {
	flag := RepoCancelStar(r.PostFormValue("openid"), r.PostFormValue("mainid"))
	if flag {
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.WriteHeader(http.StatusCreated)
	} else {
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.WriteHeader(http.StatusBadRequest)
	}
}

func GetRecordList(w http.ResponseWriter, r *http.Request) {
	vars := r.URL.Query()
	openid := vars["openid"][0]
	category, _ := strconv.Atoi(vars["category"][0])
	// lon, _ := strconv.ParseFloat(vars["lon"][0], 64)
	// lat, _ := strconv.ParseFloat(vars["lat"][0], 64)
	// construct the Response struct
	briefrecordlist := new(BriefRecordList)
	briefrecordlist.Status = 1
	briefrecordlist.Msg = "OK"
	recordsNearby := RepoFindRecordList(openid, category)
	for _, item := range recordsNearby {
		briefrecordlist.Data = append(briefrecordlist.Data, BriefRecordListItem{
			Id: item.Id,
			Lon: item.Lon,
			Lat: item.Lat,
			Avatar: item.Avatar,
			NickName: item.NickName,
			TimeStamp: item.TimeStamp,
			Content: Substr(item.Content, 0, 25),
			ShortCut: item.PicList[0],
			Views: item.Views,
			VoteUps: len(item.VoteUpList),
			VisibleFlag: item.VisibleFlag,
			})
	}
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(briefrecordlist); err != nil {
		panic(err)
	}
}

func CreateVote(w http.ResponseWriter, r *http.Request) {
	category, _ := strconv.Atoi(r.PostFormValue("category"))
	flag := RepoCreateVote(r.PostFormValue("mainid"), r.PostFormValue("openid"), category)
	var vote Vote
	if category == 1 || category == 3 {
		vote.VoteFlag = 1
	} else if category == -1 || category == -3 {
		vote.VoteFlag = -1
	} else {
		vote.VoteFlag = 0
	}
	if flag {
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.WriteHeader(http.StatusCreated)
	} else {
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.WriteHeader(http.StatusBadRequest)
	}
	if err := json.NewEncoder(w).Encode(vote); err != nil {
		panic(err)
	}
}

// 判断文件夹是否存在
func PathExists(path string) (bool, error) {
    _, err := os.Stat(path)
    if err == nil {
        return true, nil
    }
    if os.IsNotExist(err) {
        return false, nil
    }
    return false, err
}

func UploadFile(w http.ResponseWriter, r *http.Request) {
	//上传参数为uploadfile
    r.ParseMultipartForm(32 << 20)
    file, handler, err := r.FormFile("image")
    if err != nil {
    	panic(err)
    }
    defer file.Close()
    openid := r.FormValue("openid")
    // return 1441006057 in sec
    timeStamp := strconv.FormatInt(time.Now().Unix(), 10)
    random := strconv.Itoa(rand.Intn(100))
    fileDir := "/home/ubuntu/wxapp_src/"+openid
    fileName := timeStamp+"_"+random+"_"+handler.Filename

    // 判断文件夹是否存在
    isExist, err := PathExists(fileDir)
    if err != nil {
        panic(err)
    }
    if !isExist {
    	// 创建文件夹
        err := os.Mkdir(fileDir, os.ModePerm)
        if err != nil {
            panic(err)
        }
    }
    // 保存文件
    f, err := os.OpenFile(fileDir+"/"+fileName, os.O_WRONLY|os.O_CREATE, 0666)
    if err != nil {
        panic(err)
    }
    defer f.Close()
    io.Copy(f, file)
    // 返回数据
    w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(FileUrl{Status:1, FilePath:"/"+openid+"/"+fileName}); err != nil {
		panic(err)
	}
}

func DeleteFile(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	fileDir, _ := vars["fileDir"]
	fileName, _ := vars["fileName"]
	file := "/home/ubuntu/wxapp_src/"+fileDir+"/"+fileName
	err := os.Remove(file) 
	 if err != nil {
        fmt.Fprint(w, "删除失败")
    } else {
        //如果删除成功则输出 file remove OK!
        fmt.Fprint(w, "file remove OK!")
    }
}

/*
Test with this curl command:
curl -H "Content-Type: application/json" -d '{"name":"New Todo"}' http://localhost:8080/todos
*/
func CreateRecord(w http.ResponseWriter, r *http.Request) {
	var record Record
	record.Id = bson.NewObjectId()
	record.Lon, _ = strconv.ParseFloat(r.PostFormValue("lon"), 64)
	record.Lat, _ = strconv.ParseFloat(r.PostFormValue("lat"), 64)
	record.Category, _ = strconv.Atoi(r.PostFormValue("category"))
	record.OpenId = r.PostFormValue("openid")
	record.Avatar = r.PostFormValue("avatar")
	record.NickName = r.PostFormValue("nickname")
	record.Content = r.PostFormValue("content")
	record.VisibleFlag, _ = strconv.Atoi(r.PostFormValue("visibleflag"))

	s := strings.Split(r.PostFormValue("piclist"), ",")
	for index, _ := range s {
		if s[index] != "" {
			record.PicList = append(record.PicList, s[index])
		}
		//fmt.Println(s[index])
	}
	
	//record.Date = time.Now().Format("2006-01-02 15:04:05")
	record.TimeStamp = strconv.FormatInt(time.Now().Unix(), 10)
	// write the record to database
	t := RepoCreateRecord(record)
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(t); err != nil {
		panic(err)
	}
}

func Login(w http.ResponseWriter, r *http.Request) {
	var code Code
	// get the request body
	body, err := ioutil.ReadAll(io.LimitReader(r.Body, 1048576))
	if err != nil {
		panic(err)
	}
	if err := r.Body.Close(); err != nil {
		panic(err)
	}
	// unmarshal json body to struct Record
	if err := json.Unmarshal(body, &code); err != nil {
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.WriteHeader(422) // unprocessable entity
		if err := json.NewEncoder(w).Encode(err); err != nil {
			panic(err)
		}
	}

	var openid OpenID
	var loginAPI = "https://api.weixin.qq.com/sns/jscode2session?appid="+"wx1a0df4a001bd9060"+"&secret="+"9c378fcc0caa5adb70082e263eaef758"+"&js_code="+code.Code+"&grant_type=authorization_code"
	resp, err := http.Get(loginAPI)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    rbody, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        panic(err)
    }
    if err := json.Unmarshal(rbody, &openid); err != nil {
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.WriteHeader(422) // unprocessable entity
		if err := json.NewEncoder(w).Encode(err); err != nil {
			panic(err)
		}
	}
	openid.SessionKey = ""
    w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(openid); err != nil {
		panic(err)
	}
}