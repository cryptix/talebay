var pull = require('pull-stream')

exports.needs = { sbot_query: 'first' }

exports.gives = {
  ting_allskills: true,
  ting_myskills:true,
}
function countAdopted(ary) {
  var cntMap  = {}
  ary.forEach(function(msg) {
    var c = msg.value.content
    cntMap[c.sk0rg]={
      cnt:0,
      msg: msg,
    }
  })
  ary.forEach(function(msg) {
    var c = msg.value.content
    if (typeof c["adopted"] === "boolean") {
      cntMap[c.sk0rg].cnt = c["adopted"] ? cntMap[c.sk0rg].cnt + 1:cntMap[c.sk0rg].cnt - 1
    }
  })
  return cntMap
}

exports.create = function (api) {

  return {
    ting_allskills: function(){
      return api.sbot_query({query:
        [{"$filter": {"value": { "content":{ "type":"sk0rg" }}}}]
      })
    },

    ting_myskills: function(id,cb) {

      pull(
        api.sbot_query({query: [
          {"$filter": {
            "value":{
              "author": id,
              "content": {"type":"about", "sk0rg":{"$prefix":""}}
            }
          }}
        ]}),
        pull.collect(function(err, ary) {
          if(err) return cb(err)
          var adoptCnt = countAdopted(ary)
          var aboutMsgs = []
          Object.keys(adoptCnt).forEach(function(msgKey) { // deduplicate the array
            if (adoptCnt[msgKey].cnt > 0) { // only add adopted skills
              aboutMsgs.push( adoptCnt[msgKey].msg)
            }
          })
          cb(null, aboutMsgs)
        })
      )
    }
  }
}

