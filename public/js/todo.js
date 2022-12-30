console.log("this is moment", moment)
var today = new Date().toISOString().slice(0, 10);
console.log('this is today lol', today)
let inputElem = "Available",
    inputElem2 = "Available",
    dateInput,
    timeInput,
    addButton,
    sortButton,
    tutor_id,
    todoList = [],
    calendar,
    shortlistBtn,
    changeBtn,
    todoTable;
todoMain();
async function todoMain() {
    await getElements();
    await addListeners();
    await initCalendar();
    await load();
    // await renderRows(todoList);

    async function getElements() {
        dateInput = document.getElementById("dateInput");
        //https://stackoverflow.com/questions/32378590/set-date-input-fields-max-date-to-today
        var today = new Date()
        today = new Date(today.setDate(today.getDate() + 1))
        var dd = today.getDate();
        var mm = today.getMonth() + 1; // January is 0!
        var yyyy = today.getFullYear();
        if (dd < 10) {
            dd = '0' + dd
        }
        if (mm < 10) {
            mm = '0' + mm
        }

        today = yyyy + '-' + mm + '-' + dd;
        dateInput.setAttribute("min", today)
        startTimeInput = document.getElementById("startTimeInput");
        endTimeInput = document.getElementById("endTimeInput");
        addButton = document.getElementById("addBtn");
        selectElem = document.getElementById("categoryFilter");
        changeBtn = document.getElementById("changeBtn");
        todoTable = document.getElementById("todoTable");
        const request = async() => {
            const response = await fetch('/myschedule/retrievetutorid');
            const json = await response.json();
            console.log("this is testing async shit")
            console.log(json);
            tutor_id = JSON.parse(json);
        }
        await request()
        console.log(tutor_id)

        // toggleswitch = document.getElementById("toggleswitch")
    }
    //Adding the event to a list which isnt a persistent object i dont think.
    //Change this to a modal when a user click certain date.
    function addListeners() {
        dateInput.addEventListener("change", findTime)
        document.getElementById("startTimeInput").addEventListener("change", updateEndInput2)
        addButton.addEventListener("click", makeAvailableFromConsole, false);

        // changeBtn.addEventListener("click", commitEdit, false);

        //allmonth
        document.getElementById("allmonth").addEventListener("click", autoselectalldatesinmonth)
            //unselectallmonth
        document.getElementById("unselectallmonth").addEventListener("click", autounselectalldatesinmonth)

        document.getElementById("unavailableBtn").addEventListener("click", makeUnavailable)

        document.getElementById("availableBtn").addEventListener("click", makeAvailable)
        document.getElementById("saveChangesButton").addEventListener("click", saveMeetingLink)

        // toggleswitch.addEventListener("change", function(){
        //   if (this.checked){
        //     //if its checked change the text
        //     document.getElementById("toggleswitchlabel").innerText = 'Make Unavailable'
        //   } else {
        //     document.getElementById("toggleswitchlabel").innerText = 'Make Available'

        //   }

        // })

        //to capture modal closing
        $("#exampleModalCenter").on("hidden.bs.modal", closeEditModalBox);


    }

    async function makeAvailable() {
        thebutton = document.getElementById("availableBtn")
        id = thebutton.dataset.id
        date = document.getElementById("todo-edit-date").value
        starttime = document.getElementById("todo-edit-starttime").value
        endtime = document.getElementById("todo-edit-endtime").value
            //do a check if time is already unavailable

        await fetch("/myschedule/makeavailable_entry/" + tutor_id, {
                method: "POST",
                credentials: "include", //include cookies
                body: JSON.stringify({ id, date, starttime, endtime }),
                cache: "no-cache",
                headers: new Headers({
                    "content-type": "application/json"
                })
            }).then(async function(response) {
                console.log("done deleting")
                await closeEditModalBox()
                await initCalendar()
                await load()
            })
            .catch((error) => {
                console.error('Error:', error);
            });


    }
    async function makeAvailableFromConsole() {
        date = document.getElementById("dateInput").value
        starttime = document.getElementById("startTimeInput").value
        endtime = document.getElementById("endTimeInput").value
            //do a check if time is already unavailable

        await fetch("/myschedule/makeavailable_entry/" + tutor_id, {
                method: "POST",
                credentials: "include", //include cookies
                body: JSON.stringify({ date, starttime, endtime }),
                cache: "no-cache",
                headers: new Headers({
                    "content-type": "application/json"
                })
            }).then(async function(response) {
                console.log("done deleting")
                await closeEditModalBox()
                await initCalendar()
                await load()
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }
    async function makeUnavailable() {
        thebutton = document.getElementById("unavailableBtn")
        id = thebutton.dataset.id
        date = document.getElementById("todo-edit-date").value
        starttime = document.getElementById("todo-edit-starttime").value
        endtime = document.getElementById("todo-edit-endtime").value
        console.log("make unavailable", id, date, starttime, endtime)

        //do a check if time is already unavailable

        await fetch("/myschedule/unavailable_entry/" + tutor_id, {
                method: "POST",
                credentials: "include", //include cookies
                body: JSON.stringify({ id, date, starttime, endtime }),
                cache: "no-cache",
                headers: new Headers({
                    "content-type": "application/json"
                })
            }).then(async function(response) {
                console.log("done deleting")
                await closeEditModalBox()
                await initCalendar()
                await load()
            })
            .catch((error) => {
                console.error('Error:', error);
            });




    }
    async function findTime() {
        $('#startTimeInput').empty()
        $('#endTimeInput').empty()
            //do a fetch request to check whether the selected date already has time booked 

        // fetch("/fetchbreaks", {
        //     method: "POST",
        //     credentials: "include", //include cookies
        //     body: JSON.stringify(todoList),
        //     cache: "no-cache",
        //     headers: new Headers({
        //         "content-type": "application/json"
        //     })

        // }).then(function(response) {
        //     // console.log("response:",response.clone().json())
        //     return response.clone().json()
        // }).then(function(data) {
        //     // console.log("data",data)
        //     //    let retrieved = localStorage.getItem("todoList");
        //     //    todoList = JSON.parse(retrieved);
        //     todoList = data
        //     initCalendar()
        //     load()
        //         // console.log("list from local",todoList)
        //         //console.log(typeof todoList)
        //         // console.log("this is the current todoList",todoList)
        // })
        startTimeInput = document.getElementById("startTimeInput")
        dateSelected = new Date(document.getElementById("dateInput").value)
        calendarEntries = []
        donthaveAvalOrbreak = true
        haveMultipleSessionArray = range(23 - 8, startAt = 8 + 1)
        for (let index in todoList) {
            if (new Date(todoList[index].startdate).toISOString().slice(0, 10) == dateSelected.toISOString().slice(0, 10)) {
                if (todoList[index].category == "Available" || todoList[index].category == "break") {
                    console.log("this is matching", todoList[index])
                    calendarEntries.push(todoList[index])
                }
            }
        }
        if (calendarEntries.length != 0) {
            for (let entries in calendarEntries) {
                if (calendarEntries[entries].category == "Available") {
                    donthaveAvalOrbreak = false
                    startingTime = new Date(calendarEntries[entries].startdate).getHours()
                    endingTime = new Date(calendarEntries[entries].enddate).getHours() == 0 ? 24 : new Date(calendarEntries[entries].enddate).getHours()
                    console.log("this is startimt enand endtime", startingTime, endingTime)
                    optionArray = range(endingTime - startingTime, startAt = startingTime)
                    for (let index in optionArray) {
                        time = optionArray[index]
                        option = document.createElement("option")
                        option.text = timeToFormat(time) + " [Available]"
                        option.value = time
                        option.dataset.endingtime = endingTime
                        startTimeInput.add(option)
                    }
                } else if (calendarEntries[entries].category == "break") {
                    donthaveAvalOrbreak = false
                    startingTime = new Date(calendarEntries[entries].startdate).getHours()
                    endingTime = new Date(calendarEntries[entries].enddate).getHours() == 0 ? 24 : new Date(calendarEntries[entries].enddate).getHours()
                    optionArray = range(endingTime - startingTime, startAt = startingTime)
                    for (let index in optionArray) {
                        time = optionArray[index]
                        option = document.createElement("option")
                        option.text = timeToFormat(time) + " [break]"
                        option.value = time
                        option.dataset.endingtime = endingTime
                        startTimeInput.add(option)
                    }
                }
                // else {//have multiple sessions 
                //     //for each session we remove from the start array
                //     if ( donthaveAvalOrbreak == true){
                //         startingTime = new Date(calendarEntries[entries].startdate).getHours()
                //         endingTime = new Date(calendarEntries[entries].enddate).getHours() == 0 ? 24 : new Date(calendarEntries[entries].enddate).getHours()
                //         optionArray = range(endingTime - startingTime, startAt = startingTime)
                //         console.log("this is start array", startArray)
                //         for (let index in optionArray) { //remove from haveMultiplesessionarray
                //             haveMultipleSessionArray.filter( function(x){return  x != optionArray[index]})
                //         }
                //     }
                // }
            }
        } else { //start from 9 till 11
            startArray = range(23 - 8, startAt = 8 + 1)
            console.log("this is start array", startArray)
            for (let index in startArray) {
                time = startArray[index]
                option = document.createElement("option")
                option.text = timeToFormat(time)
                option.value = time
                option.dataset.endingtime = 24
                startTimeInput.add(option)
            }
        }
        // if (donthaveAvalOrbreak == true && haveMultipleSessionArray.length != 15){
        //     for (let index in haveMultipleSessionArray) {
        //         currentstart = haveMultipleSessionArray[index]
        //         if (haveMultipleSessionArray[index] != haveMultipleSessionArray[index-1] + 1){
        //             time = currentstart
        //             option = document.createElement("option")
        //             option.text = timeToFormat(time)
        //             option.dataset.endingtime = haveMultipleSessionArray[index - 1]

        //         }
        //         time = startArray[index]
        //         option = document.createElement("option")
        //         option.text = timeToFormat(time)
        //         option.value = time
        //         option.dataset.endingtime = 24
        //         startTimeInput.add(option)
        //     }
        // }
        await updateEndInput2()
    }

    async function autounselectalldatesinmonth() {
        // get all remaining dates of the month
        var currentdate = GetCalendarDateRange()
            // console.log(currentdate.getFullYear(), currentdate.getMonth())
        var lastday = new Date(currentdate.getFullYear(), currentdate.getMonth() + 1, 0).getDate(); //https://www.w3resource.com/javascript-exercises/javascript-date-exercise-9.php
        // console.log("this is the last day now do a for loop from the current date to last date and send a post request", lastday)
        today = new Date(Date.parse(today))
        console.log(today)
        if (today.getMonth() == currentdate.getMonth()) {
            //just take remaining date
            for (let i = today.getDate(); i <= lastday; i++) {
                startdate = new Date(today.getFullYear(), today.getMonth(), i, 9)
                enddate = new Date(today.getFullYear(), today.getMonth(), i, 24)
                await autodeletedates(startdate, enddate)
            }
            console.log('this is after unselect', todoList)
        } else {
            console.log("future month")
            for (let i = 1; i <= lastday; i++) {
                startdate = new Date(currentdate.getFullYear(), currentdate.getMonth(), i, 9)
                enddate = new Date(currentdate.getFullYear(), currentdate.getMonth(), i, 24)
                await autodeletedates(startdate, enddate)
            }

            //it means the user is looking at the future month
        }
        await deletefromdatabase()
    }

    async function autoselectalldatesinmonth() {
        // get all remaining dates of the month
        var currentdate = GetCalendarDateRange()
            // console.log(currentdate.getFullYear(), currentdate.getMonth())
        var lastday = new Date(currentdate.getFullYear(), currentdate.getMonth() + 1, 0).getDate(); //https://www.w3resource.com/javascript-exercises/javascript-date-exercise-9.php
        console.log("this is the last day now do a for loop from the current date to last date and send a post request", lastday)
        today = new Date(Date.parse(today))
        console.log("this is today", today)
        if (today.getMonth() == currentdate.getMonth()) {
            //just take remaining date
            for (let i = today.getDate(); i <= lastday; i++) {
                startdate = new Date(today.getFullYear(), today.getMonth(), i, 9)
                enddate = new Date(today.getFullYear(), today.getMonth(), i, 24)
                await autochangedates(startdate, enddate)
            }
        } else {
            console.log("future month")
            for (let i = 1; i <= lastday; i++) {
                startdate = new Date(currentdate.getFullYear(), currentdate.getMonth(), i, 9)
                enddate = new Date(currentdate.getFullYear(), currentdate.getMonth(), i, 24)
                console.log("making future dates available:", startdate, enddate)
                await autochangedates(startdate, enddate)
            }

            //it means the user is looking at the future month
        }
        await initCalendar()
        await load()


    }

    async function autochangedates(startdate, enddate) {
        availability = { '9': 'Available', '10': 'Available', '11': 'Available', '12': 'Available', "13": 'Available', "14": 'Available', "15": 'Available', "16": 'Available', "17": 'Available', "18": 'Available', "19": 'Available', "20": 'Available', "21": 'Available', "22": 'Available', "23": 'Available' }
            // console.log("saving this", startdate, enddate )
            // console.log('checking whether this dates has duplicates', startdate,enddate)    //we making it available/unavailable on a full time slow 9am to 12 am
        theresADuplicate = false
        for (let i = 0; i < todoList.length; i++) { //looping through to check whether entry exists in the todolist
            todoStartDate = new Date(Date.parse(todoList[i].startdate))
            todoEndDate = new Date(Date.parse(todoList[i].enddate))
                // console.log("++",todoStartDate ,todoEndDate)
            if ((todoStartDate.getMonth() == startdate.getMonth() && todoStartDate.getDate() == startdate.getDate()) && (todoEndDate.getMonth() == enddate.getMonth() && todoEndDate.getDate() == enddate.getDate())) { //https://stackoverflow.com/questions/492994/compare-two-dates-with-javascript
                console.log("there is a duplicate: ", todoList[i])
                theresADuplicate = true
                return null
                    // else{                 // it means there is a session entry, get the start time and end time
                    //     theresASession = True
                    //     startTime =   new Date(Date.parse(todoList[i].startdate)).getHours()
                    //     endTime = new Date(Date.parse(todoList[i].enddate)).getHours()
                    //     theRange = range(endTime - startTime, startTime)
                    //     for (j in theRange) {
                    //         console.log("Booking", theRange[j])
                    //         availability[theRange[j]] = "theres a session here"
                    //     }
                    // }
            }
        }
        if (theresADuplicate == false) {
            date = startdate.toISOString().slice(0, 10)
            starttime = 9
            endtime = 24
                //do a check if time is already unavailable

            await fetch("/myschedule/makeavailable_entry/" + tutor_id, {
                    method: "POST",
                    credentials: "include", //include cookies
                    body: JSON.stringify({ date, starttime, endtime }),
                    cache: "no-cache",
                    headers: new Headers({
                        "content-type": "application/json"
                    })
                }).then(async function(response) {
                    console.log("done deleting")

                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }
        // if (theresASession = false){
        //     //if they never find
        //     let obj = {
        //         id: _uuid(),
        //         category: 'Available',
        //         startdate: startdate,
        //         enddate: enddate,
        //         starttime: '0900',
        //         endtime: '0000',
        //         done: false
        //     }
        //     renderRow(obj)
        //     todoList.push(obj)
        //     save()
        // }else{
        // }


    }
    async function autodeletedates(startdate, enddate) {
        // removing from calendar object
        calendarEventList = calendar.getEvents()
        console.log("this is calendar event list", calendarEventList)
        for (let i = 0; i < calendarEventList.length; i++) {
            //if the startdate and enddate is the same remove the event from the calendar
            thecurrentevent = calendarEventList[i]
            thecurrenteventstart = thecurrentevent.start
            thecurrenteventend = thecurrentevent.end
            thecurrenteventtitle = thecurrentevent.title
            if (thecurrenteventtitle == "Available" || thecurrentevent == "break") {
                if ((thecurrenteventstart.getDate() == startdate.getDate() && (thecurrenteventstart.getMonth()) == startdate.getMonth()) && (thecurrenteventend.getDate() == enddate.getDate() && thecurrenteventend.getMonth() == enddate.getMonth())) {
                    thecurrentevent.remove()
                }
            }
        }


        //removing from todolist and therefore the database after
        todoList = todoList.filter(function(dateobject) {
            // new Date(Date.parse(todoList[i].enddate)
            //basically converting the dateobject into a Date object and then comparing to our startdate function paramater
            // if (new Date(Date.parse(dateobject.startdate)).getDate() == startdate.getDate() && (new Date(Date.parse(dateobject.startdate)).getMonth() == startdate.getMonth()) && (new Date(Date.parse(dateobject.enddate)).getDate() == enddate.getDate() && new Date(Date.parse(dateobject.enddate)).getMonth() == enddate.getMonth())) {
            //     console.log("this needs to be deleted lol", dateobject)
            //     console.log("because")
            // }
            if (new Date(Date.parse(dateobject.startdate)).getMonth() == startdate.getMonth()) {
                if (!(dateobject.category == "Available" || dateobject.category == "break")) {
                    return dateobject
                }

            } else if (new Date(Date.parse(dateobject.startdate)).getMonth() != startdate.getMonth()) {
                return dateobject
            }

            // if ((new Date(Date.parse(dateobject.startdate)).getMonth() != startdate.getMonth()) && !(dateobject.category == "Available" || dateobject.category == "break")) {
            //     console.log("this need not be deleted lol", dateobject)
            //     console.log("because")
            // }
            // return ((new Date(Date.parse(dateobject.startdate)).getDate() != startdate.getDate() && (new Date(Date.parse(dateobject.startdate)).getMonth() != startdate.getMonth()) && (new Date(Date.parse(dateobject.enddate)).getDate() != enddate.getDate() && new Date(Date.parse(dateobject.enddate)).getMonth() != enddate.getMonth())))

            // return ((new Date(Date.parse(dateobject.startdate)).getMonth() != startdate.getMonth()) && !(dateobject.category == "Available" || dateobject.category == "break"))
        })
    }

    function GetCalendarDateRange() {
        //check if the month they are looking at is the current month or the future month, if current month just take the todays date, else take the first month

        var currentdate = document.getElementsByClassName("fc-toolbar-title")[0].innerText
            // console.log("currently looking at this current date", currentdate)
        var whatthe = Date.parse(currentdate)
        var therealdate = new Date(new Date(whatthe).setDate(1))
        console.log('Whatthe', whatthe)
        console.log('therealdate', therealdate)
        return therealdate

        // var calendar = $('#calendar').fullCalendar('getCalendar');
        // var view = calendar.view;
        // var start = view.start._d;
        // return start;
    }

    function addEntry(event) {

        let dateValue = dateInput.value;
        console.log("This is date:", dateValue)
        dateInput.value = ""; // reseting to empty

        let timeValue = timeInput.value;
        console.log("This is time:", timeValue)

        timeInput.value = "";
        if (dateValue === "" || timeValue === "") { //if statement to check if input is empty if empty alert, else save
            alert("Date or time input is empty");

        } else {
            let obj = {
                id: _uuid(),
                category: 'Available',
                date: dateValue,
                time: timeValue,
                done: false,
            };
            renderRow(obj);

            todoList.push(obj);

            save();
            console.log("This is object", obj);
            //every add entry submit to flask using the route, and then add to db

        }
    }

    function save() {
        //need bracket for the variable-key because idky but it works
        let stringified = JSON.stringify(todoList);
        localStorage.setItem("todoList", stringified);
        //before we post we check whether the data exists in our local todo list
        fetch("/myschedule/submit_entry", {
            method: "POST",
            credentials: "include", //include cookies
            body: JSON.stringify(todoList),
            cache: "no-cache",
            headers: new Headers({
                "content-type": "application/json"
            })

        });
    }

    function deletefromdatabase() {
        let stringified = JSON.stringify(todoList);
        localStorage.setItem("todoList", stringified);
        //before we post we check whether the data exists in our local todo list
        fetch("/myschedule/delete_entry", {
            method: "POST",
            credentials: "include", //include cookies
            body: JSON.stringify(todoList),
            cache: "no-cache",
            headers: new Headers({
                "content-type": "application/json"
            })

        }).then(function(response) {
            // console.log("response:",response.clone().json())
            return response.clone().json()
        }).then(function(data) {
            // console.log("data",data)
            //    let retrieved = localStorage.getItem("todoList");
            //    todoList = JSON.parse(retrieved);
            todoList = data
            initCalendar()
            load()
                // console.log("list from local",todoList)
                //console.log(typeof todoList)
                // console.log("this is the current todoList",todoList)
        })
    }

    async function load() {
        todoList = null
            //add a code here where retrieve todolist from flask and set inside local storage
            //https://www.youtube.com/watch?v=Oive66jrwBs
        console.log("==== Loading ====")
        await fetch("/myschedule/fetch/" + tutor_id)
            .then(function(response) {
                console.log("response:", response.clone().json())
                return response.clone().json()
            })
            .then(function(data) {
                //    let retrieved = localStorage.getItem("todoList");
                //    todoList = JSON.parse(retrieved);
                todoList = data
                console.log("this is todoList", data)

                // console.log("list from local",todoList)
                //console.log(typeof todoList)
                // console.log("this is the current todoList",todoList)
                renderRows(todoList);
            })
        console.log("==== FInished ====")

    }

    function renderRows(arr) {
        $("#todoTable").empty()
        arr.forEach(todoObj => {
            // console.log("rendering",todoObj);
            renderRow(todoObj);
        })
    }

    function renderRow({ id, category, startdate, enddate, done }) {
        // console.log("what the fuck is this", startdate)
        starttime = formatAMPM(new Date(Date.parse(startdate)))
        endtime = formatAMPM(new Date(Date.parse(enddate)))
            // add a new row only if its not break or available
        if (category != "Available" && category != "break") {
            let table = document.getElementById("todoTable");

            let trElem = document.createElement("tr");
            table.appendChild(trElem);

            // date cell
            let dateElem = document.createElement("td");

            dateElem.innerText = formatDate(startdate);
            trElem.appendChild(dateElem);

            // start time cell
            let startTimeElem = document.createElement("td");
            startTimeElem.innerText = starttime;
            trElem.appendChild(startTimeElem);
            // end time cell
            let endTimeElem = document.createElement("td");
            endTimeElem.innerText = endtime;
            trElem.appendChild(endTimeElem);

            // category cell
            let tdElem3 = document.createElement("td");
            tdElem3.innerText = category;
            tdElem3.className = "categoryCell";
            trElem.appendChild(tdElem3);

            //add to calendar
            dateElem.dataset.type = "date";
            dateElem.dataset.value = startdate;
            startTimeElem.dataset.type = "time";
            startTimeElem.dataset.value = starttime
            endTimeElem.dataset.type = "time"
            endTimeElem.dataset.value = endtime

            dateElem.dataset.id = id;
            startTimeElem.dataset.id = id;
            endTimeElem.dataset.id = id;
        }

        addEvent({
            id: id,
            title: category,
            start: startdate,
            end: enddate
        });


        // console.log("checking what dataset is",startTimeElem)

        function deleteItem() {
            trElem.remove();

            for (let i = 0; i < todoList.length; i++) {
                if (todoList[i].id == this.dataset.id)
                    todoList.splice(i, 1);
            }
            save();

            // remove from calendar
            calendar.getEventById(this.dataset.id).remove();
        }

        function checkboxClickCallback() {
            trElem.classList.toggle("strike");
            for (let i = 0; i < todoList.length; i++) {
                if (todoList[i].id == this.dataset.id)
                    todoList[i]["done"] = this.checked;
            }
            save();
        }

    }

    function _uuid() {
        var d = Date.now();
        if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
            d += performance.now(); //use high-precision timer if available
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    function sortEntry() {
        todoList.sort((a, b) => {
            let aDate = Date.parse(a.date);
            let bDate = Date.parse(b.date);
            return aDate - bDate;
        });

        save();

        clearTable();

        renderRows(todoList);
    }


    function initCalendar() {
        var today = new Date()
        today = new Date(today.setDate(today.getDate() + 1))
        today = today.toISOString().slice(0, 10);
        console.log('this is today lol', today)
        var calendarEl = document.getElementById('calendar');

        calendar = new FullCalendar.Calendar(calendarEl, {
            // Other Calendar Options go here
            // viewDisplay: function(view){
            //   $('.fc-day').filter(
            //     function(index){
            //     return moment( $(this).data('date') ).isBefore(moment(),'day') 
            //   }).addClass('fc-other-month');
            // },
            selectable: false,
            // select: function(start, end) {
            //   if(start.isBefore(moment())) {
            //       $('#calendar').fullCalendar('unselect');
            //       return false;
            //   }},

            initialView: 'dayGridMonth',
            validRange: {
                start: today
            },
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            events: [],
            eventClick: function(info) {
                toEditItem(info.event);
            },
            eventBackgroundColor: "#378006",
            eventBorderColor: "#378006",
        });

        calendar.render();
    }

    function addEvent(event) {
        // console.log("hellow nuzul this is event", event)
        if (event.title == "break") { //https://stackoverflow.com/questions/18619903/jquery-full-calendar-set-a-different-color-to-each-event-from-front-end
            event["color"] = '#FF0000'
        } else if (event.title != "break" && event.title != "Available") {
            event["color"] = '#8A2BE2'
        }
        // console.log("hellow nuzul this is 2", event)

        calendar.addEvent(event);

    }

    function clearTable() {
        // Empty the table, keeping the first row
        let trElems = document.getElementsByTagName("tr");
        for (let i = trElems.length - 1; i > 0; i--) {
            trElems[i].remove();
        }

        calendar.getEvents().forEach(event => event.remove());
    }


    function onTableClicked(event) {
        if (event.target.matches("td") && event.target.dataset.editable == "true") {
            let tempInputElem;
            switch (event.target.dataset.type) {
                case "date":
                    tempInputElem = document.createElement("input");
                    tempInputElem.type = "date";
                    tempInputElem.value = event.target.dataset.value;
                    break;
                case "time":
                    tempInputElem = document.createElement("input");
                    tempInputElem.type = "time";
                    tempInputElem.value = event.target.innerText;
                    break;
                case "category":
                    tempInputElem = document.createElement("input");
                    tempInputElem.value = event.target.innerText;

                    break;
                default:
            }
            event.target.innerText = "";
            event.target.appendChild(tempInputElem);

            tempInputElem.addEventListener("change", onChange, false);


        }

        function onChange(event) {
            let changedValue = event.target.value;
            let id = event.target.parentNode.dataset.id;
            let type = event.target.parentNode.dataset.type;

            // remove from calendar
            calendar.getEventById(id).remove();

            todoList.forEach(todoObj => {
                if (todoObj.id == id) {
                    //todoObj.todo = changedValue;
                    todoObj[type] = changedValue;

                    addEvent({
                        id: id,
                        title: changedValue,
                        start: todoObj.date,
                    });
                }
            });
            save();

            if (type == "date") {
                event.target.parentNode.innerText = formatDate(changedValue);
            } else {
                event.target.parentNode.innerText = changedValue;
            }

        }
    }

    function formatDate(date) {
        let dateObj = new Date(date);
        let formattedDate = dateObj.toLocaleString("en-GB", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
        return formattedDate;
    }

    async function showEditModalBox(event) {
        if (event.title == "Available" || event.title == "break") {
            $('#exampleModalCenter').modal('show');
        } else {
            await prefillSessionModal(event)
            $('#sessionModal').modal('show');
            //another modal 
        }
        // document.getElementById("todo-overlay").classList.add("slidedIntoView");
    }
    async function prefillSessionModal(event) {
        console.log("this is booking id as well", event)
        sessionInfo = null
        todoList.forEach(async(todoObj) => {
            if (todoObj.id == event.id) {
                console.log("/myschedule/sessionInfo/" + tutor_id + "/" + todoObj.booking_id)
                await fetch("/myschedule/sessionInfo/" + tutor_id + "/" + todoObj.booking_id).then(function(response) {
                    return response.clone().json()
                }).then(function(data) {
                    // console.log("this is all sessions retrieved: ", data)
                    sessionInfo = data
                    console.log("this is sessionInfo", sessionInfo)
                        // update everything and add the booking, Id inside the input

                    document.getElementById("tuteeName").innerHTML = "<h2>" + sessionInfo.tuteeName + "</h2>"
                    document.getElementById("tuteeName").setAttribute("href", "/user/viewProfile/" + sessionInfo.UserId)

                    document.getElementById("sessionName").innerHTML = sessionInfo.sessionName
                    document.getElementById("courseName").innerHTML = sessionInfo.courseName
                    document.getElementById("datetime").innerHTML = sessionInfo.bookDate
                    document.getElementById("meetingLink").value = sessionInfo.meetingLink
                    document.getElementById("totalPrice").innerHTML = "$" + sessionInfo.totalPrice
                    document.getElementById("tuteeProfilePic").src = "/images/profilepictures/" + sessionInfo.tuteeProfilePic
                    document.getElementById("saveChangesButton").dataset.booking_id = todoObj.booking_id
                }).catch((error) => {
                    console.log("error fetchin all session", error)
                });
            }
        })

    }
    async function saveMeetingLink() {
        meetingLink = document.getElementById("meetingLink").value
        bookingId = document.getElementById("saveChangesButton").dataset.booking_id
        await fetch("/myschedule/updateMeetingLink/" + bookingId, {
                method: "POST",
                credentials: "include", //include cookies
                body: JSON.stringify({ meetingLink }),
                cache: "no-cache",
                headers: new Headers({
                    "content-type": "application/json"
                })
            }).then(async function(response) {
                console.log("done deleting")
                await closeEditModalBox()
                await initCalendar()
                await load()
            })
            .catch((error) => {
                console.error('Error:', error);
            });

    }

    function closeEditModalBox(event) {
        starttimeinput = document.getElementById("todo-edit-starttime")
        console.log("this is tstart time inp ut ", starttimeinput)
        $('#todo-edit-starttime').empty()
        $('#todo-edit-endtime').empty()

        endTimeInput = document.getElementById("todo-edit-endtime")
            // $('#todo-edit-endtime').empty()
            //to clear the options
        var length = starttimeinput.options.length;
        for (i = length - 1; i >= 0; i--) {
            starttimeinput.options[i] = null;
        }
        endTimeInput = ""
            // document.getElementById("todo-edit-endtime").disabled = true;
        $('#exampleModalCenter').modal('hide');
        $('#sessionModal').modal('hide');

        // clearEndInput();
    }

    function commitEdit(event) {
        closeEditModalBox();

        let id = event.target.dataset.id;
        let category = document.getElementById("todo-edit-category").value;
        let date = document.getElementById("todo-edit-startdate").value;
        // let starttime = document.getElementById("todo-edit-starttime").value;
        // let endtime = document.getElementById("todo-edit-endtime").value

        // remove from calendar
        calendar.getEventById(id).remove();

        for (let i = 0; i < todoList.length; i++) {
            if (todoList[i].id == id) {
                todoList[i] = {
                    id: id,
                    category: category,
                    date: date,
                    time: time
                };

                addEvent({
                    id: id,
                    title: category,
                    start: todoList[i].date,
                });
            }
        }

        save();

        // // Update the table
        // let tdNodeList = todoTable.querySelectorAll("td");
        // for(let i = 0; i < tdNodeList.length; i++){
        //   if(tdNodeList[i].dataset.id == id){
        //     let type = tdNodeList[i].dataset.type;
        //     switch(type){
        //       case "date" :
        //         tdNodeList[i].innerText = formatDate(date);
        //         break;
        //       case "time" :
        //         tdNodeList[i].innerText = time;
        //         break;
        //       case "category" :
        //         tdNodeList[i].innerText = category;
        //         break;
        //     }
        //   }
        // }
    }

    async function toEditItem(event) {
        console.log("to edit item", event.id)
        let id = event.id;
        console.log("!!!!!!!this is event before showeditmodal box", event.title)
        await showEditModalBox(event);



        // if (event.target) // mouse event
        //     id = event.target.dataset.id;
        // else // calendar event
        //     id = event.id;

        await preFillEditForm(id);
    }

    function preFillEditForm(id) {
        console.log("prefill", id)
        let result = todoList.find(todoObj => todoObj.id == id);
        let { category, startdate, enddate } = result;
        startDateParsed = new Date(Date.parse(startdate))
        endDateParsed = new Date(Date.parse(enddate))

        console.log("prefill this is date", startDateParsed)
        console.log("prefill this is enddate", endDateParsed)

        document.getElementById("todo-edit-category").value = category;
        document.getElementById("todo-edit-date").value = `${startDateParsed.toISOString().slice(0,10)}`;
        startTimeInput = document.getElementById("todo-edit-starttime")
        startTimeInput.addEventListener("change", updateEndInput)
            // console.log("this is start time input", startTimeInput)
            // console.log("<option value='" + startDateParsed.getHours()  + "'>" + formatAMPM(startDateParsed)  + "</option>")
            // var startOption = document.createElement("option")
            // startOption.text = formatAMPM(startDateParsed)
            // startOption.value = startDateParsed.getHours()
            // startTimeInput.add(startOption)

        //24 hours  + 1.
        // startArray = range(23 - startDateParsed.getHours(), startAt = startDateParsed.getHours() + 1)
        // console.log("this is start array", startArray)
        // for (let index in startArray) {
        //     time = startArray[index]
        //     option = document.createElement("option")
        //     option.text = timeToFormat(time)
        //     option.value = time
        //     startTimeInput.add(option)

        //loop through todoList find all entries with the the same date, and store it inside a dictionary, then we can make our startArray
        calendarEntries = []
        for (let index in todoList) {
            if (new Date(todoList[index].startdate).toISOString().slice(0, 10) == startDateParsed.toISOString().slice(0, 10)) {
                console.log("this is matching", todoList[index])
                calendarEntries.push(todoList[index])
            }
        }
        for (let entries in calendarEntries) {
            if (calendarEntries[entries].category == "Available") {
                startingTime = new Date(calendarEntries[entries].startdate).getHours()
                endingTime = new Date(calendarEntries[entries].enddate).getHours() == 0 ? 24 : new Date(calendarEntries[entries].enddate).getHours()
                console.log("this is startimt enand endtime", startingTime, endingTime)
                optionArray = range(endingTime - startingTime, startAt = startingTime)
                for (let index in optionArray) {
                    time = optionArray[index]
                    option = document.createElement("option")
                    option.text = timeToFormat(time) + " [Available]"
                    option.value = time
                    option.dataset.endingtime = endingTime
                    startTimeInput.add(option)
                }
            } else if (calendarEntries[entries].category == "break") {
                startingTime = new Date(calendarEntries[entries].startdate).getHours()
                endingTime = new Date(calendarEntries[entries].enddate).getHours() == 0 ? 24 : new Date(calendarEntries[entries].enddate).getHours()
                optionArray = range(endingTime - startingTime, startAt = startingTime)
                for (let index in optionArray) {
                    time = optionArray[index]
                    option = document.createElement("option")
                    option.text = timeToFormat(time) + " [break]"
                    option.value = time
                    option.dataset.endingtime = endingTime
                    startTimeInput.add(option)
                }
            }
        }
        // startArray = range(23 - 8, startAt = 8 + 1)
        // console.log("this is start array", startArray)
        // for (let index in startArray) {
        //     time = startArray[index]
        //     option = document.createElement("option")
        //     option.text = timeToFormat(time)
        //     option.value = time
        //     startTimeInput.add(option)
        // }
        // startTimeInput.innerHTMl = "<option value='" + startDateParsed.getHours  + "'>" + formatAMPM(startDateParsed)  + "</option>"
        // endTimeInput = document.getElementById("todo-edit-endtime")
        // var endOption = document.createElement("option")
        // endOption.text = formatAMPM(endDateParsed)
        // endOption.value = endDateParsed.getHours()
        // endTimeInput.add(endOption)
        updateEndInput()

        console.log("before unavailable btn", id)
        document.getElementById("unavailableBtn").dataset.id = id;
        document.getElementById("availableBtn").dataset.id = id;
    }

    function updateEndInput() {
        //emptying end time input box
        endTimeInput = document.getElementById("todo-edit-endtime")
        endTimeInput.disabled = false;
        endTimeInput.innerHTML = ""
        startTimeInput = document.getElementById("todo-edit-starttime")
        console.log("this is starTimeinput", startTimeInput)
        startValue = $('#todo-edit-starttime').find(":selected").val(); //https://stackoverflow.com/questions/10659097/jquery-get-selected-option-from-dropdown
        endingtime = $('#todo-edit-starttime').find(":selected").data("endingtime")
        console.log("tyhis is update endinput", endingtime, endingtime - startValue)
        endTimeInput = document.getElementById("todo-edit-endtime")
        endArray = range(parseInt(endingtime) - parseInt(startValue), startAt = parseInt(startValue) + 1)
        console.log(endArray)
        for (let index in endArray) {
            time = endArray[index]
            option = document.createElement("option")
            option.text = timeToFormat(time)
            option.value = time
            endTimeInput.add(option)
        }
    }

    function updateEndInput2() {
        $('#endTimeInput').empty()
            //emptying end time input box
        endTimeInput = document.getElementById("endTimeInput")
        endTimeInput.disabled = false;
        endTimeInput.innerHTML = ""
        startTimeInput = document.getElementById("startTimeInput")
        startValue = $('#startTimeInput').find(":selected").val(); //https://stackoverflow.com/questions/10659097/jquery-get-selected-option-from-dropdown
        endingtime = $('#startTimeInput').find(":selected").data("endingtime")
        console.log("2.0 this is startvalyue", startValue)

        console.log("2. tyhis is update endinput", endingtime, endingtime - startValue)
        endArray = range(parseInt(endingtime) - parseInt(startValue), startAt = parseInt(startValue) + 1)
        console.log(endArray)
        for (let index in endArray) {
            time = endArray[index]
            option = document.createElement("option")
            option.text = timeToFormat(time)
            option.value = time
            endTimeInput.add(option)
        }
    }

    function clearEndInput() {
        var select = document.getElementById("DropList");
        var length = select.options.length;
        for (i = length - 1; i >= 0; i--) {
            select.options[i] = null;
        }
    }
    //to format date to a 12 hour formate
    function formatAMPM(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }

    function range(size, startAt = 0) {
        return [...Array(size).keys()].map(i => i + startAt);
    }

    function timeToFormat(hour) {
        if (hour <= 11) {
            strTime = hour + ":" + '00' + " am"
        } else if (hour == 12) {
            strTime = hour + ":" + '00' + " pm"
        } else if (hour <= 23) {
            strTime = hour % 12 + ":" + '00' + " pm"
        } else if (hour == 24) {
            strTime = "12" + ":" + '00' + " am"
        }
        return strTime
    }

}