function alertBattleStations() {
    var event = {
        "Name": "prepareTacticalCombat",
        "Id": uuid(),
        "Timestamp": getUTCDatetime(),
        "Scope": "all",
        "Status": "Issued"
    };

    eventList.push(event);
    eventQueue.push(event);
    
    postEvent(event);
}