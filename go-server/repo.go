package main

import (
    "gopkg.in/mgo.v2"
    "gopkg.in/mgo.v2/bson"
)

var (
    records Records
    mgoSession *mgo.Session
)


func init() {
    //connect to mongodb
    session, err := mgo.Dial("localhost")
    if err != nil {
        panic(err)
    }
    mgoSession = session
    mgoSession.SetMode(mgo.Monotonic, true)
}


func RepoCreateRecord(record Record) Record {
    // insert data to Collection
    session := mgoSession.Copy()
    defer session.Close()
    err := session.DB("local").C("records").Insert(record)
    if err != nil {

    }

    return record
}

func RepoCreateComment(comment CommentItem) CommentItem {
    session := mgoSession.Copy()
    defer session.Close()
    err := session.DB("local").C("comments").Insert(comment)
    if err != nil {

    }
    return comment
}

func RepoCreateReply(reply ReplyItem, commentid string) ReplyItem {
    selector := bson.M{"_id": bson.ObjectIdHex(commentid)}
    data := bson.M{"$push": bson.M{"reply": reply},"$inc": bson.M{"count": 1}}

    session := mgoSession.Copy()
    defer session.Close()
    err := session.DB("local").C("comments").Update(selector, data)
    if err != nil {

    }
    return reply
}

func RepoFindNearbyRecords(lon float64, lat float64) Records {
    var recordsNearby Records
    var record Record
    // query terms
    m := bson.M {
        "lon": bson.M {
            "$gte": lon - 0.01,
            "$lte": lon + 0.01,
        },
        "lat": bson.M {
            "$gte": lat - 0.01,
            "$lte": lat + 0.01,
        },
    }
    // find in database
    session := mgoSession.Copy()
    defer session.Close()
    iter := session.DB("local").C("records").Find(m).Iter()
    for iter.Next(&record) {
        if record.Content != "<mys>" {
            recordsNearby = append(recordsNearby, record)
        }
    }

    defaultId := "5b1299036f6eac643837477d"
    if len(recordsNearby) == 0 {
        record = RepoFindRecord(defaultId)
        recordsNearby = append(recordsNearby, record)
    }
    return recordsNearby
}

func RepoFindRecordList(openid string, category int) Records {
    var recordList Records
    var record Record
    // query terms
    var m bson.M
    switch category {
    case 0://mys
        m = bson.M{"openid": openid}
        // find in database
        session := mgoSession.Copy()
        defer session.Close()
        iter := session.DB("local").C("records").Find(m).Iter()
        for iter.Next(&record) {
            recordList = append(recordList, record)
        }
        return recordList

    case 1://star
        m = bson.M{"openid": openid}
        var star Star
        session := mgoSession.Copy()
        defer session.Close()
        if err := session.DB("local").C("stars").Find(m).One(&star); err != nil {
            return recordList
        }
        for _, item := range star.StarList {
            selector := bson.M{"_id": bson.ObjectIdHex(item)}
            if err := session.DB("local").C("records").Find(selector).One(&record); err != nil {
                continue
            }
            recordList = append(recordList, record)
        }
        return recordList

    case 2://history
        m = bson.M{"openid": openid}
        // haven't finshed yet
    }
    return recordList
}

func RepoFindRecord(id string) Record {
    var record Record
    m := bson.M{"_id": bson.ObjectIdHex(id)}
    data := bson.M{"$inc": bson.M{"views": 1}}
    // find in database
    session := mgoSession.Copy()
    defer session.Close()
    if err := session.DB("local").C("records").Update(m, data); err != nil {

    }
    if err := session.DB("local").C("records").Find(m).One(&record); err != nil {
        
    }
    return record
}

func RepoDeleteRecord(id string) bool {
    m := bson.M{"_id": bson.ObjectIdHex(id)}

    session := mgoSession.Copy()
    defer session.Close()
    if err := session.DB("local").C("records").Remove(m); err != nil {
        return false
    }
    return true
}

func RepoFindComments(id string) Comments {
    var commentlist Comments
    var comment CommentItem
    m := bson.M{"mainid": bson.ObjectIdHex(id)}
    // find in database
    session := mgoSession.Copy()
    defer session.Close()
    iter := session.DB("local").C("comments").Find(m).Iter()
    for iter.Next(&comment) {
        commentlist = append(commentlist, comment)
    }
    return commentlist
}

func RepoCreateStar(openid string, mainid string) bool{
    m := bson.M{"openid": openid}
    data := bson.M{"$push": bson.M{"starlist": mainid}}

    session := mgoSession.Copy()
    defer session.Close()
    if err := session.DB("local").C("stars").Update(m, data); err != nil {
        if err == mgo.ErrNotFound {
            var star Star
            star.OpenId = openid
            star.StarList = append(star.StarList, mainid)
            if err := session.DB("local").C("stars").Insert(star); err != nil {

            } else {
                return true
            }
        }
    } else {
        return true
    }
    return false
}

func RepoCancelStar(openid string, mainid string) bool {
    m := bson.M{"openid": openid}
    data := bson.M{"$pull": bson.M{"starlist": mainid}}

    session := mgoSession.Copy()
    defer session.Close()
    if err := session.DB("local").C("stars").Update(m, data); err != nil {

        return false
    }
    return true
}

func RepoFindStar(openid string, mainid string) int {
    var star Star
    m := bson.M{"openid": openid, "starlist": bson.M{"$in": []string{mainid}} }
    //m := bson.M{"openid": openid}
    session := mgoSession.Copy()
    defer session.Close()
    if err := session.DB("local").C("stars").Find(m).One(&star); err != nil {
        return 0
    }
    return 1
}


func RepoCreateVote(mainid string, openid string, category int) bool {
    m := bson.M{"_id": bson.ObjectIdHex(mainid)}
    var data bson.M
    switch category {
    case 1:
        data = bson.M{"$push": bson.M{"voteuplist": openid}}
    case 2:
        data = bson.M{"$pull": bson.M{"voteuplist": openid}}
    case 3:
        data = bson.M{"$push": bson.M{"voteuplist": openid}, "$pull": bson.M{"votedownlist": openid}}
    case -1:
        data = bson.M{"$push": bson.M{"votedownlist": openid}}
    case -2:
        data = bson.M{"$pull": bson.M{"votedownlist": openid}}
    case -3:
        data = bson.M{"$push": bson.M{"votedownlist": openid}, "$pull": bson.M{"voteuplist": openid}}
    }

    session := mgoSession.Copy()
    defer session.Close()
    if err := session.DB("local").C("records").Update(m, data); err != nil {
        return false
    }
    return true
}