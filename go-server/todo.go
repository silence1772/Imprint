package main

import "gopkg.in/mgo.v2/bson"

type Records []Record
// The struct storage in database
type Record struct {
	Id bson.ObjectId `bson:"_id"`
	Lon float64 `json:"lon"`
	Lat float64 `json:"lat"`
	Category int `json:"category"`
	OpenId string `json:"openid"`
	Avatar string `json:"avatar"`
	NickName string `json:"nickname"`
	TimeStamp string `json:"timestamp"`
	Content string `json:"content"`
	PicList []string `json:"piclist"`
	VoteUp int `json:"voteup"`
	VoteUpList []string `json:"voteuplist"`
	VoteDown int `json:"votedown"`
	VoteDownList []string `json:"votedownlist"`
	VoteFlag int `json:"voteflag"`
	Views int `json:"views"`
	//Likes int `json:"likes"`
	// extra filed return to front-end
	Comments []CommentItem `json:"comments"`
	HasStared int `json:"hasstared"`
	VisibleFlag int `json:"visibleflag"`
}


type Comments []CommentItem
type CommentItem struct {
	Id bson.ObjectId `bson:"_id"`
	// 对应内容的id
	MainId bson.ObjectId `bson:"mainid"`
	OpenId string `json:"openid"`
	Avatar string `json:"avatar"`
	NickName string `json:"nickname"`
	TimeStamp string `json:"timestamp"`
	Content string `json:"content"`
	Support int `json:"support"`
	Count int `json:"count"`
	Reply []ReplyItem `json:"reply"`
}
type ReplyItem struct {
	Id bson.ObjectId `bson:"_id"`
	From_OpenId string `json:"from_openid"`
	From_Avatar string `json:"from_avatar"`
	From_NickName string `json:"from_nickname"`
	TimeStamp string `json:"timestamp"`
	Content string `json:"content"`
	Support int `json:"support"`
}



// The struct for http GET return
type BriefRecordList struct {
	Status int `json:"status"`
	Msg string `json:"msg"`
	Data []BriefRecordListItem `json:"data"`
}

type BriefRecordListItem struct {
	Id bson.ObjectId `bson:"_id"`
	Lon float64 `json:"lon"`
	Lat float64 `json:"lat"`
	Avatar string `json:"avatar"`
	NickName string `json:"nickname"`
	TimeStamp string `json:"timestamp"`
	Content string `json:"content"`
	ShortCut string `json:"shortcut"` 
	Views int `json:"views"`
	VoteUps int `json:"voteups"`
	VisibleFlag int `json:"visibleflag"`
}

// The struct for upload file return
type FileUrl struct {
	Status int `json:"status"`
	FilePath string `json:"filepath"`
}

// login
type Code struct {
	Code string `json:"code"`
}
type OpenID struct {
	SessionKey string `json:"session_key"`
	OpenID string `json:"openid"`
}

// star
type Star struct {
	OpenId string `json:"openid"`
	StarList []string `json:"starlist"`
}

// vote
type Vote struct {
	VoteFlag int `json:"voteflag"`
}