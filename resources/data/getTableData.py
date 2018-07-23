import json
from operator import itemgetter, attrgetter

globalNumTopics=0
paperDetails=[]
paperObjects=[]

def gatherTopicDistrib(seqList):
    topicList=[0] * globalNumTopics
    for num in seqList:
        topicList[num] = topicList[num]+1

    return topicList

def getMajorityTopic(simMat):
    #get the topic with the highest score
    max=0.0
    index=0
    for i in range(0, len(simMat)):
        currSim = simMat[i]
        if(currSim > max):
            max = currSim
            index=i

    return index


with open("CHI-2018.json") as chiFile:
    jsonData = json.load(chiFile)

    rows=jsonData["rowData"]

    overallcount=0
    # for i in range(0,10):
    for i in range(0, len(rows)/20):
        #for each of the papers
        thisPaper=[]

        for x in range(0, 20):
            #get 20 of our chunks that make it up
            thisPaper.append(rows[overallcount])

            overallcount=overallcount+1

        #we now have our 20 chunks as an array
        #we want to build an object for that single paper
        #taking into account each chunks main topic and by what percentage
        # print(thisPaper[0])
        globalNumTopics = len(thisPaper[0]['[REQ]TopicDistribution'])

        sequenceTopics=[]

        for chunk in thisPaper:
            # print(chunk)
            currSimMat = chunk['[REQ]TopicDistribution']
            majTopic = getMajorityTopic(currSimMat)
            sequenceTopics.append(majTopic)

        topicElemObj = gatherTopicDistrib(sequenceTopics)
        paperDetails.append({
            "sequence":sequenceTopics,
            "distribution":topicElemObj,
            "name":thisPaper[0]["sourceName"],
            "ID": i
        })

        currentObj={"name":thisPaper[0]["sourceName"], "ID":i}
        for i in range(0, globalNumTopics):
            tname = "topic"+str(i)
            tvalue = topicElemObj[i]
            currentObj[tname] = tvalue

        paperObjects.append(currentObj)

    #print(paperObjects)

    #need to gather the top 10 papers for each of the topics
    #this can be done by sorting based on an attribute in an object
    #so we need a list of objects first with an attribute of the frequency

    topPapers=[]
    for i in range(0, globalNumTopics):
        curr = "topic"+str(i)
        top10=sorted(paperObjects, key=itemgetter("topic"+str(i)), reverse=True)

        topnames=[]
        for i in range(0,10):
            current=top10[i]
            name=current["ID"]
            topnames.append(name)

        topPapers.append(topnames)

    final_paper_list={"paper_details":paperDetails}
    with open('paperDetails.json', 'w') as outfile:
        json.dump(final_paper_list, outfile)

    final_topic_list={"topic_details":topPapers}
    with open('topicDetails.json','w') as outfile:
        json.dump(final_topic_list,outfile)

chiFile.close()
