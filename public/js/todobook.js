const DEFAULT_OPTION = "Choose category";

let inputElem = "Available",
    inputElem2 = "Available",
    dateInput,
    timeInput,
    addButton,
    sortButton,
    tutor_id,
    course_id,
    todoList = [],
    calendar,
    shortlistBtn,
    changeBtn,
    todoTable,
    AllSessionArray,
    currentSelectedIndex,
    selectedList = [];
todoMain();

async function todoMain() {
    await getElements();
    await addListeners();
    await initCalendar();
    console.log("going to prefil selectsession")
    await prefillSelectSession();
    await load();

    function getElements() {
        selectElem = document.getElementById("categoryFilter");
        changeBtn = document.getElementById("changeBtn");
        todoTable = document.getElementById("todoTable");
        tutor_id = document.getElementById("tutor_id").innerText;
        course_id = window.location.href.split("/")[6];
        tutor_id = window.location.href.split("/")[5];
        console.log("this is tutorid lol", tutor_id)
        console.log("this is courseId Lol", course_id)

    }
    //Adding the event to a list which isnt a persistent object i dont think.
    //Change this to a modal when a user click certain date.
    function addListeners() {
        document.getElementById("selectedSession").addEventListener("change", changeSession)
        $("#exampleModalCenter").on("hidden.bs.modal", closeEditModalBox);

        document.getElementById("bookButton").addEventListener("click", book)


    }

    async function prefillSelectSession() {
        console.log("inside prefill")
            //fetch session array
        await fetch("/myschedule/fetchAllSession/" + tutor_id + "/" + course_id).then(function(response) {
            return response.clone().json()
        }).then(function(data) {
            // console.log("this is all sessions retrieved: ", data)
            AllSessionArray = data
        }).catch((error) => {
            console.log("error fetchin all session", error)
        });

        console.log("this is allsession array", AllSessionArray)
        selectSession = document.getElementById("selectedSession")
        for (let index in AllSessionArray) {
            sessionName = AllSessionArray[index].session_title
            option = document.createElement("option")
            option.text = sessionName
            option.value = index //storing index so we can access it which session they picked later
            selectSession.add(option)
        }
        currentSelectedIndex = 0
        document.getElementById("sessionDescription").innerHTML = AllSessionArray[0].session_description
        document.getElementById("sessionApproximateHours").innerHTML = `${AllSessionArray[0].time_approx} Hours`
    }
    async function changeSession() {
        currentSelectedIndex = document.getElementById("selectedSession").value
        document.getElementById("sessionDescription").innerHTML = AllSessionArray[currentSelectedIndex].session_description
        document.getElementById("sessionApproximateHours").innerHTML = `${AllSessionArray[currentSelectedIndex].time_approx} Hours`
        await load()
    }
    async function filterAvailability() {
        //based on the changed sesion and the approx hour of that session see which dates are available
    }

    function save() {
        console.log("saving selected items:", selectedList);
        let stringified = JSON.stringify(selectedList);
        localStorage.setItem("selectedList", stringified);
        localStorage.setItem("tutor_id", tutor_id);
        localStorage.setItem("course_id", course_id);
    }

    async function load() {
        todoList = null //emptying it
        calendar.removeAllEvents();
        await fetch("/myschedule/fetchAllSession/" + tutor_id + "/" + course_id).then(function(response) {
            return response.clone().json()
        }).then(function(data) {
            // console.log("this is all sessions retrieved: ", data)
            AllSessionArray = data
        }).catch((error) => {
            console.log("error fetchin all session", error)
        });
        //add a code here where retrieve todolist from flask and set inside local storage
        //https://www.youtube.com/watch?v=Oive66jrwBs
        console.log("==== Loading ====")
        await fetch("/myschedule/fetch/" + tutor_id)
            .then(function(response) {
                console.log("response:", response.clone().json())
                return response.clone().json()
            })
            .then(function(data) {
                console.log("data", data)
                    //    let retrieved = localStorage.getItem("todoList");
                    //    todoList = JSON.parse(retrieved);
                todoList = data
                    // console.log("list from local",todoList)
                    //console.log(typeof todoList)
                    // console.log("this is the current todoList",todoList)
                renderRows(todoList);
            })
        console.log("==== FInished ====")

    }

    function renderRows(arr) {
        arr.forEach(todoObj => {
            console.log("renderows", todoObj)
            currentSelectedIndex = document.getElementById("selectedSession").value
            console.log("this is currentSelectdIndex", currentSelectedIndex)
            endtime = new Date(todoObj.enddate).getHours() == 0 ? 24 : new Date(todoObj.enddate).getHours()
            duration = endtime - new Date(todoObj.startdate).getHours()
            console.log("renderwoewdjns", endtime, new Date(todoObj.startdate).getHours(), duration)
            console.log("current time approx", AllSessionArray[currentSelectedIndex].time_approx)
            if (duration >= parseInt(AllSessionArray[currentSelectedIndex].time_approx)) {
                renderRow(todoObj);
            }
        })
    }
    var count = 0;

    function renderRow({ id, category, startdate, enddate }) {
        // console.log("what the fuck is this", startdate)
        starttime = formatAMPM(new Date(Date.parse(startdate)))
        endtime = formatAMPM(new Date(Date.parse(enddate)))
            //     // add a new row only if its not break or available
            // if (category == "Available") {
            //     let table = document.getElementById("todoTable");

        //     let trElem = document.createElement("tr");
        //     table.appendChild(trElem);
        //     // checkbox cell
        //     let checkboxElem = document.createElement("input");
        //     // console.log("thisis checkbox", checkboxElem)
        //     checkboxElem.type = "checkbox";
        //     checkboxElem.dataset.id = id;
        //     checkboxElem.name = "settings";
        //     checkboxElem.addEventListener("change", function() {
        //         if (this.checked) {
        //             console.log("checked")
        //             for (let i = 0; i < todoList.length; i++) {
        //                 //                console.log(todoList[i].id);
        //                 //                console.log(checkboxElem.dataset.id);
        //                 if (todoList[i].id == checkboxElem.dataset.id) {
        //                     selectedList.push(todoList[i])
        //                         //                  console.log("Selected: ",todoList[i].date, todoList[i].time,todoList[i], "and saved")
        //                     console.log("this is selected list", selectedList)
        //                         //write code so that it will change the display to appear
        //                     count++;
        //                     console.log("this is incremented count", count)

        //                     var button = document.getElementById('continue_button');
        //                     console.log(button);
        //                     button.style.display = "inline";
        //                 }
        //             }
        //         } else {
        //             //if unchecked delete from selected list
        //             console.log("deleting", checkboxElem.dataset.date)
        //             for (var j = 0; j < selectedList.length; j++) {
        //                 if (selectedList[j].id === checkboxElem.dataset.id) {
        //                     selectedList.splice(j, 1);
        //                 }

        //             }
        //             count--;
        //             console.log("this is decremented count", count)

        //             if (count == 0) {
        //                 var button = document.getElementById('continue_button');
        //                 console.log(button);
        //                 button.style.display = "none";
        //             }
        //             // console.log("user did not Select: ",todoList[i].date, todoList[i].time,todoList[i]);
        //         }
        //         save();
        //     });
        // //add to calendar
        // dateElem.dataset.type = "date";
        // dateElem.dataset.value = startdate;
        // startTimeElem.dataset.type = "time";
        // startTimeElem.dataset.value = starttime
        // endTimeElem.dataset.type = "time"
        // endTimeElem.dataset.value = endtime

        // dateElem.dataset.id = id;
        // startTimeElem.dataset.id = id;
        // endTimeElem.dataset.id = id;
        if (category == "Available") {
            addEvent({
                id: id,
                title: category,
                start: startdate,
                end: enddate
            });
        }
    }
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

function initCalendar() {
    var today = new Date().toISOString().slice(0, 10);
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
                    title: "Available",
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

function showEditModalBox(event) {
    $('#exampleModalCenter').modal('show');
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
    // clearEndInput();
}

function commitEdit(event) {
    closeEditModalBox();

    let id = event.target.dataset.id;
    let category = document.getElementById("todo-edit-category").value;
    let date = document.getElementById("todo-edit-date").value;
    let time = document.getElementById("todo-edit-time").value;

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

    // Update the table
    let tdNodeList = todoTable.querySelectorAll("td");
    for (let i = 0; i < tdNodeList.length; i++) {
        if (tdNodeList[i].dataset.id == id) {
            let type = tdNodeList[i].dataset.type;
            switch (type) {
                case "date":
                    tdNodeList[i].innerText = formatDate(date);
                    break;
                case "time":
                    tdNodeList[i].innerText = time;
                    break;
                case "category":
                    tdNodeList[i].innerText = category;
                    break;
            }
        }
    }
}

function toEditItem(event) {
    showEditModalBox();

    let id;

    if (event.target) // mouse event
        id = event.target.dataset.id;
    else // calendar event
        id = event.id;

    preFillEditForm(id);
}

function preFillEditForm(id) {
    console.log("prefill", id)
    let result = todoList.find(todoObj => todoObj.id == id);
    let { category, startdate, enddate } = result;
    startDateParsed = new Date(Date.parse(startdate))
    console.log("this is start date parsed", startDateParsed.getHours())
    endDateParsed = new Date(Date.parse(enddate))

    console.log("prefill this is date", startDateParsed)
    console.log("prefill this is enddate", endDateParsed)

    document.getElementById("todo-edit-category").value = category;
    document.getElementById("todo-edit-date").value = `${startDateParsed.toISOString().slice(0,10)}`;
    startTimeInput = document.getElementById("todo-edit-starttime")
    startTimeInput.addEventListener("change", updateEndInput)
    correctedEndInput = (endDateParsed.getHours() == 0 ? 24 : endDateParsed.getHours()) + 1
        // console.log("this is the calculation", correctedEndInput, startDateParsed.getHours(), parseInt(AllSessionArray[currentSelectedIndex].time_approx))
    startArray = range(correctedEndInput - startDateParsed.getHours() - parseInt(AllSessionArray[currentSelectedIndex].time_approx), startAt = startDateParsed.getHours())
    console.log("this is start array", startArray)
    for (let index in startArray) {
        time = startArray[index]
        option = document.createElement("option")
        option.text = timeToFormat(time)
        option.value = time
        startTimeInput.add(option)
    }
    updateEndInput()

    document.getElementById("bookButton").dataset.id = id;
    //appending extra attribute inside form
    $("#bookForm").submit(function() {
        $("<input />").attr("type", "hidden")
            .attr("name", "calendarId")
            .attr("value", id)
            .appendTo("#bookForm");
        $("<input />").attr("type", "hidden")
            .attr("name", "sessionId")
            .attr("value", AllSessionArray[currentSelectedIndex].session_id)
            .appendTo("#bookForm");
        return true;
    });
}

function updateEndInput() {
    //emptying end time input box, so that there are no options
    $('#todo-edit-endtime').empty()
    startTimeInput = document.getElementById("todo-edit-starttime")
    startValue = parseInt(startTimeInput.value)
    endTimeInput = document.getElementById("todo-edit-endtime")
        // startValue + parseInt(AllSessionArray[currentSelectedIndex].time_approx)
    option = document.createElement("option")
    option.text = timeToFormat(startValue + parseInt(AllSessionArray[currentSelectedIndex].time_approx))
    option.value = startValue + parseInt(AllSessionArray[currentSelectedIndex].time_approx)
    endTimeInput.add(option)

}

async function book() {
    theButton = document.getElementById("bookButton")
    calendarId = theButton.dataset.id
    date = document.getElementById("todo-edit-date").value
    startTime = document.getElementById("todo-edit-starttime").value
    endTime = document.getElementById("todo-edit-endtime").value
    sessionId = AllSessionArray[currentSelectedIndex].session_id
    await fetch("/myschedule/book/" + tutor_id, {
            method: "POST",
            credentials: "include", //include cookies
            body: JSON.stringify({ calendarId, date, startTime, endTime, sessionId }),
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