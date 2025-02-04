function main() {
    // check if lms is logged in
    if (window.location.href.includes("web?#id="))
        return;

    // check if the current page is the LMS DMC page
    if (!window.location.href.includes("view_type=form&model=obe.grade.book&menu_id=572")) {
        return;
    }
    try {
        // Select the table parent container
        var select = '/html/body/div[2]/table/tbody/tr/td[2]/div/div/div/div/div/div[2]/div/div[4]/div/div/div/div/table[5]/tbody/tr/td/div/div';
        const element = document.evaluate(select, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        // If the element is not loaded, wait for 2 seconds and try again
        if (!element) {
            setTimeout(main, 2000);
            return;
        }

        // Select the table
        var selector = `#${element.id} > div > div > table`
        var table = document.querySelector(selector);
        // If the table is not loaded, wait for 2 seconds and try again
        if (!table) {
            setTimeout(main, 2000);
            return;
        }

        // If the table has rows
        if (table) {
            // If the table has only 3 rows(empty rows), wait for 2 seconds and try again
            if (table.rows.length == 3) {
                setTimeout(main, 2000);
                return;
            }

            // If the table has more than 3 rows
            var rows = table.rows;

            // get the first semester name and update the value for current semester
            var semester1 = rows[2].cells[0].textContent;
            var obj = [
                {
                    "semester": semester1,
                    "courses": []
                }
            ]

            // Iterate through the rows and get the data of all the semesters            
            var count = 0;
            for (var i = 2; i < rows.length - 1; i++) {

                // get the current semester name
                var semester = rows[i].cells[0].textContent;

                // If the current semester is the same as the previous semester
                if (semester === semester1) {
                    var course = rows[i].cells[1].textContent;
                    var courseCode = course.split(" ")[0];
                    var courseTitle = course.split(" ").slice(1).join(" ");
                    var instructor = rows[i].cells[2].textContent;
                    var creditHour = rows[i].cells[3].textContent;
                    var gradePoint = rows[i].cells[4].textContent;
                    var grade = rows[i].cells[5].textContent;
                    var status = rows[i].cells[6].textContent;
                    var courseObj = {
                        "courseCode": courseCode,
                        "courseTitle": courseTitle,
                        "instructor": instructor,
                        "creditHour": creditHour,
                        "gradePoint": gradePoint,
                        "grade": grade,
                        "status": status
                    }
                    obj[count].courses.push(courseObj);
                }

                // If the current semester is different from the previous semester
                if (semester !== semester1) {
                    count++;
                    semester1 = semester;
                    var course = rows[i].cells[1].textContent;
                    var courseCode = course.split(" ")[0];
                    var courseTitle = course.split(" ").slice(1).join(" ");
                    var instructor = rows[i].cells[2].textContent;
                    var creditHour = rows[i].cells[3].textContent;
                    var gradePoint = rows[i].cells[4].textContent;
                    var grade = rows[i].cells[5].textContent;
                    var status = rows[i].cells[6].textContent;
                    var courseObj = {
                        "courseCode": courseCode,
                        "courseTitle": courseTitle,
                        "instructor": instructor,
                        "creditHour": creditHour,
                        "gradePoint": gradePoint,
                        "grade": grade,
                        "status": status
                    }
                    obj.push({
                        "semester": semester1,
                        "courses": [courseObj]
                    });
                }
            }

            // If the grade is "WF" or "F", set the credit hour to 0, only if the course is passed in any subsequent semester
            let semestersData = obj;
            // Iterate through each semester
            for (let i = 0; i < semestersData.length; i++) {
                let currentSemesterCourses = semestersData[i].courses;

                // Iterate through each course in the current semester
                for (let j = 0; j < currentSemesterCourses.length; j++) {
                    let currentCourse = currentSemesterCourses[j];

                    // Check if the grade is "WF" or "F"
                    if (currentCourse.grade === "WF" || currentCourse.grade === "F") {
                        let currentCourseCode = currentCourse.courseCode;
                        let currentCourseTitle = currentCourse.courseTitle;

                        // Check subsequent semesters
                        for (let k = i + 1; k < semestersData.length; k++) {
                            let nextSemesterCourses = semestersData[k].courses;

                            // Check if the course is passed in any subsequent semester
                            for (let l = 0; l < nextSemesterCourses.length; l++) {
                                let nextCourse = nextSemesterCourses[l];
                                if (nextCourse.courseCode === currentCourseCode &&
                                    nextCourse.courseTitle === currentCourseTitle &&
                                    (nextCourse.grade !== "WF" && nextCourse.grade !== "F")) {
                                    // Set credit hour to 0 in the previous semester
                                    currentCourse.creditHour = "0.00";
                                    break; // Move to the next course in the current semester
                                }
                            }
                        }
                    }
                }
            }
            console.log(semestersData)

            var count = 1;
            var previous = 0;

            // Add the GPA and CGPA to the table
            semestersData.forEach((object) => {
                // row for the GPA
                var row = document.createElement("tr");
                row.style.backgroundColor = "#ffffff";
                row.style.fontWeight = "bold";

                // empty cell
                var cell = document.createElement("td");
                row.appendChild(cell);

                // empty cell
                var cell2 = document.createElement("td");
                row.appendChild(cell2);

                // empty cell
                var cell3 = document.createElement("td");
                row.appendChild(cell3);

                // calculate the Credit Hours of the current semester and add it to the table
                var cell4 = document.createElement("td");

                // Exclude the courses with grade "I" and "IP" from the calculation
                var ch = object.courses.reduce((a, b) => b.grade !== "I" && b.grade !== "IP" ? a + parseFloat(b.creditHour) : a, 0);

                cell4.textContent = ch.toFixed(1);
                row.appendChild(cell4);

                // calculate the Grade Points of the current semester and add it to the table
                var cell5 = document.createElement("td");

                // Exclude the courses with grade "I" and "IP" from the calculation
                var gp = object.courses.reduce((a, b) => b.grade !== "I" && b.grade !== "IP" ? a + parseFloat(b.gradePoint) : a, 0);
                cell5.textContent = gp.toFixed(2);
                row.appendChild(cell5);

                // Add the GPA row to the table of the current semester
                var cell6 = document.createElement("td");
                cell6.textContent = "GPA: " + (gp / ch).toFixed(3);
                cell6.style.width = "80px";
                row.appendChild(cell6);

                // if the current semester is not the first semester, show the CGPA
                if (count > 1) {
                    var cell7 = document.createElement("td");
                    // calculate the Credit Points till the current semester excluding the courses with grade "I" and "IP"                    
                    var totalcpa = semestersData.slice(0, count).reduce((a, b) => a + parseFloat(b.courses.reduce((a, b) => b.grade !== "I" && b.grade !== "IP" ? a + parseFloat(b.gradePoint) : a, 0)), 0);

                    // calculate the Credit Hours till the current semester excluding the courses with grade "I" and "IP"
                    var totalch = semestersData.slice(0, count).reduce((a, b) => a + parseFloat(b.courses.reduce((a, b) => b.grade !== "I" && b.grade !== "IP" ? a + parseFloat(b.creditHour) : a, 0)), 0);

                    // Add the CGPA to the table of the current semester
                    cell7.textContent = "CGPA: " + (totalcpa / totalch).toFixed(3);
                    cell7.style.width = "90px";
                    row.appendChild(cell7);
                    count++;
                }
                // if the current semester is first semester, don't show the CGPA
                else {
                    count++;
                }
                table.rows[object.courses.length + 2 + previous].parentNode.insertBefore(row, table.rows[object.courses.length + 2 + previous]);
                previous += object.courses.length + 1;

            });

            // row for the CGPA
            var row = table.insertRow();
            row.style.backgroundColor = "#ffffff";
            row.style.fontWeight = "bold";

            // calculate the CGPA excluding the courses with grade "I" and "IP"
            var gp = semestersData.reduce((a, b) => a + parseFloat(b.courses.reduce((a, b) => b.grade !== "I" && b.grade !== "IP" ? a + parseFloat(b.gradePoint) : a, 0)), 0);
            var ch = semestersData.reduce((a, b) => a + parseFloat(b.courses.reduce((a, b) => b.grade !== "I" && b.grade !== "IP" ? a + parseFloat(b.creditHour) : a, 0)), 0);

            var cgpa = gp / ch;

            // Add the CGPA to the table
            row.insertCell(); // empty cell
            row.insertCell(); // empty cell
            var cell = row.insertCell(); // cgpa cell
            cell.textContent = `CGPA: ${gp} ÷ ${ch} = ${cgpa.toFixed(3)}`; // cgpa value

            var form = document.querySelector("body > div.openerp.openerp_webclient_container > table > tbody > tr > td.oe_application > div > div > div > div > div > div.oe_view_manager_view_form > div > div.oe_form_container > div > div > div > div");
            form.style.width = "900px"
            form.style.margin = "100px 100px";
        }
    }
    catch (err) {
        console.log(err);
    }


    try {
        // Create the "Print DMC" button
        var printButton = document.createElement("button");
        printButton.textContent = "Print DMC to PDF";
        printButton.classList.add("oe_button");
        printButton.classList.add("oe_highlight");
        printButton.style.marginLeft = "5px";

        // Append the button to a specific location
        var header = document.querySelector('body > div.openerp.openerp_webclient_container > table > tbody > tr > td.oe_application > div > div > div > div > div > div.oe_view_manager_view_form > div > div.oe_form_container > div > div > div > div > table:nth-child(4) > tbody > tr:nth-child(2) > td:nth-child(1)');
        if (header) {
            header.appendChild(printButton);
        }

        // Add the event listener to the button to open the print window
        printButton.addEventListener("click", function () {
            
            // Inject print-specific CSS into the document
            var style = document.createElement("style");
            style.innerHTML = `
             @media print {
                 body * {
                     visibility: hidden;
                 }
                 #notebook_page_9 > div > div > table, #notebook_page_9 > div > div > table * {
                     visibility: visible;
                 }
                     
                 #notebook_page_9 > div > div {
                     position: absolute;
                        left: 0;
                        top: 0;
                 }                     
             }`;
            document.head.appendChild(style);

            // Contains Text "Student DMC"
            const t1 = document.querySelector("body > div.openerp.openerp_webclient_container > table > tbody > tr > td.oe_application > div > div > div > div > div > div.oe_view_manager_view_form > div > div.oe_form_container > div > div > div > div > table:nth-child(1)");
            
            // Contains Registration Number and Student Name
            const t2 = document.querySelector("body > div.openerp.openerp_webclient_container > table > tbody > tr > td.oe_application > div > div > div > div > div > div.oe_view_manager_view_form > div > div.oe_form_container > div > div > div > div > table:nth-child(2)");

            // Contains Final CGPA
            const tfoot = document.querySelector("#notebook_page_9 > div > div > table > tfoot > tr:nth-child(3)");
            if (tfoot) {
                tfoot.style.display = "none";
            }

            // Contains the table to be printed
            const printContainer = document.querySelector("#notebook_page_9 > div > div ");

            // Append Registration Number and Student Name to the top of the table
            if (printContainer) {
                if (t2) {
                    printContainer.insertBefore(t2, printContainer.firstChild);
                }

                // Insert t1 before the table
                if (t1) {
                    printContainer.insertBefore(t1, printContainer.firstChild);
                }
            }

            // Trigger the print dialog for the current page
            window.print();

            // Reverse the changes by reload
            window.location.reload();
        });

    }
    catch (err) {
        console.log(err);
    }

}

// Call the main function when the page is loaded
window.onpopstate = function (event) {
    const hashLoc = "view_type=form&model=obe.grade.book&menu_id=572"
    const hash = window.location.hash;;

    if (hash.includes(hashLoc)) {
        main();
    }
}