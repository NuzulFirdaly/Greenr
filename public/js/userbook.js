const DEFAULT_OPTION = "Choose category";

let inputElem = "Available",
    inputElem2 = "Available",
    dateInput,
    timeInput,
    addButton,
    sortButton,
    user_id,
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
    await load();

    function getElements() {
        // todoTable = document.getElementById("todoTable");
        // tutor_id = document.getElementById("tutor_id").innerText;
        // course_id = window.location.href.split("/")[6];
        user_id = window.location.href.split("/")[5];
        console.log("this is user_id lol", user_id)
            // console.log("this is courseId Lol", course_id)

    }
    //Adding the event to a list which isnt a persistent object i dont think.
    //Change this to a modal when a user click certain date.
    function addListeners() {

        $("#BookingModal").on("hidden.bs.modal", closeEditModalBox);


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
        // await fetch("/myschedule/fetchAllSession/" + tutor_id + "/" + course_id).then(function(response) {
        //     return response.clone().json()
        // }).then(function(data) {
        //     // console.log("this is all sessions retrieved: ", data)
        //     AllSessionArray = data
        // }).catch((error) => {
        //     console.log("error fetchin all session", error)
        // });
        //add a code here where retrieve todolist from flask and set inside local storage
        //https://www.youtube.com/watch?v=Oive66jrwBs
        console.log("==== Loading ====")
        await fetch("/myschedule/fetchbookings/" + user_id)
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
            renderRow(todoObj);
        })
    }
    var count = 0;

    function renderRow({ id, category, startdate, enddate }) {
        // console.log("what the fuck is this", startdate)
        starttime = formatAMPM(new Date(Date.parse(startdate)))
        endtime = formatAMPM(new Date(Date.parse(enddate)))


        addEvent({
            id: id,
            title: category,
            start: startdate,
            end: enddate
        });

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
    } else {
        event["color"] = '#FFA500'
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
    console.log("this is event", event)
    $('#BookingModal').modal('show');
    await prefillBookingModal(event)
}

async function prefillBookingModal(event) {
    console.log("this is booking id as well", event)
    sessionInfo = null
    todoList.forEach(async(todoObj) => {
        if (todoObj.id == event.id) {
            console.log("/myschedule/sessionInfo/" + user_id + "/" + todoObj.booking_id)
            await fetch("/myschedule/sessionInfo/" + user_id + "/" + todoObj.booking_id).then(function(response) {
                return response.clone().json()
            }).then(function(data) {
                // console.log("this is all sessions retrieved: ", data)
                sessionInfo = data
                console.log("this is sessionInfo", sessionInfo)
                    // update everything and add the booking, Id inside the input 
                document.getElementById("tutorName").innerHTML = "<h2>" + sessionInfo.tutorName + "</h2>"
                document.getElementById("tutorName").setAttribute("href", "/user/viewProfile/" + sessionInfo.TutorId)
                document.getElementById("sessionName").innerHTML = sessionInfo.sessionName
                document.getElementById("courseName").innerHTML = sessionInfo.courseName
                document.getElementById("datetime").innerHTML = sessionInfo.bookDate
                if (sessionInfo.meetingLink == null) {
                    document.getElementById("meetingLink").style.textDecoration = 'none'
                    document.getElementById("meetingLink").style.pointerEvents = 'none'
                    document.getElementById("meetingLink").style.color = "black"
                    document.getElementById("meetingLink").innerHTML = "The tutor hasn't provided a meeting link yet."
                } else {
                    document.getElementById("meetingLink").innerHTML = sessionInfo.meetingLink
                    document.getElementById("meetingLink").setAttribute("href", sessionInfo.meetingLink)
                }
                document.getElementById("totalPrice").innerHTML = "$" + sessionInfo.totalPrice
                document.getElementById("tutorProfilePic").src = "/images/profilepictures/" + sessionInfo.tutorProfilePic

            }).catch((error) => {
                console.log("error fetchin all session", error)
            });
        }
    })

}

function closeEditModalBox(event) {
    document.getElementById("meetingLink").style.textDecoration = 'underline'
    document.getElementById("meetingLink").style.pointerEvents = 'auto'
    document.getElementById("meetingLink").style.color = "blue"

    $('#BookingModal').modal('hide');
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
    showEditModalBox(event);

    let id;

    if (event.target) // mouse event
        id = event.target.dataset.id;
    else // calendar event
        id = event.id;

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