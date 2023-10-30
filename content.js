
function main() {
    if (window.location.href.includes("web?#id="))
        return;
    if(!window.location.href.includes("view_type=form&model=obe.grade.book&menu_id=572")){
        return;
    }
    try {
        var select = '/html/body/div[2]/table/tbody/tr/td[2]/div/div/div/div/div/div[2]/div/div[4]/div/div/div/div/table[5]/tbody/tr/td/div/div';
        const element = document.evaluate(select, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if(!element){
            setTimeout(main, 2000);
            return;
        }        

        var selector = `#${element.id} > div > div > table`
        var table = document.querySelector(selector);
        if(!table){
            setTimeout(main, 2000);
            return;
        }
        if (table) {
            if(table.rows.length == 3)
            {
                setTimeout(main, 2000);
                return;
            }
            var rows = table.rows;
            var semester1 = rows[2].cells[0].textContent;
            var obj = [
                {
                    "semester": semester1,
                    "courses": [] 
                }
            ]
            var count = 0;
            for (var i = 2; i < rows.length-1; i++) {
                var semester = rows[i].cells[0].textContent;
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
                if(semester !== semester1){
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
            var previous = 0;
            console.log(obj);
            var count = 1;
            obj.forEach((object) => {
                var row = document.createElement("tr");
                row.style.backgroundColor = "#ffffff";
                row.style.fontWeight = "bold";

                var cell = document.createElement("td");
                row.appendChild(cell);
                
                var cell2 = document.createElement("td");
                row.appendChild(cell2);
                
                var cell3 = document.createElement("td");
                row.appendChild(cell3);
                
                var cell4 = document.createElement("td");
                var ch = object.courses.reduce((a, b) => a + parseFloat(b.creditHour), 0);
                cell4.textContent = ch.toFixed(1);                
                row.appendChild(cell4);

                var cell5 = document.createElement("td");
                var gp = object.courses.reduce((a, b) => a + parseFloat(b.gradePoint), 0);
                cell5.textContent = gp.toFixed(2);
                row.appendChild(cell5);

                var cell6 = document.createElement("td");
                cell6.textContent = "GPA: " + (gp/ch).toFixed(3);
                cell6.style.width = "80px";
                row.appendChild(cell6);   

                if(count > 1){
                    var cell7 = document.createElement("td");
                    var totalcpa = obj.slice(0, count).reduce((a, b) => a + parseFloat(b.courses.reduce((a, b) => a + parseFloat(b.gradePoint), 0)), 0);
                    var totalch = obj.slice(0, count).reduce((a, b) => a + parseFloat(b.courses.reduce((a, b) => a + parseFloat(b.creditHour), 0)), 0);
                    cell7.textContent = "CGPA: " + (totalcpa/totalch).toFixed(3);
                    // cell7.textContent = "CGPA: 3.232";
                    cell7.style.width = "90px";
                    row.appendChild(cell7);
                    count++;
                }
                else{
                    count++;
                }
                table.rows[object.courses.length + 2 + previous].parentNode.insertBefore(row, table.rows[object.courses.length + 2 + previous]);
                previous += object.courses.length + 1;

            });
            var row = table.insertRow();
            row.style.backgroundColor = "#ffffff";
            row.style.fontWeight = "bold";
            
            var gp = obj.reduce((a, b) => a + parseFloat(b.courses.reduce((a, b) => a + parseFloat(b.gradePoint), 0)), 0);
            var ch = obj.reduce((a, b) => a + parseFloat(b.courses.reduce((a, b) => a + parseFloat(b.creditHour), 0)), 0);
            var cgpa = gp/ch;
            
            row.insertCell();
            row.insertCell();
            var cell = row.insertCell();
            cell.textContent = `CGPA: ${gp} ÷ ${ch} = ${cgpa.toFixed(4)}`;



            var form = document.querySelector("body > div.openerp.openerp_webclient_container > table > tbody > tr > td.oe_application > div > div > div > div > div > div.oe_view_manager_view_form > div > div.oe_form_container > div > div > div > div");
            form.style.width = "900px"
            form.style.margin = "100px 100px";
        }
    }
    catch (err) {
        console.log(err);
    }

}


window.onpopstate = function(event) {
    const hashLoc = "view_type=form&model=obe.grade.book&menu_id=572"
    const hash = window.location.hash;;

    if(hash.includes(hashLoc)){
        main();
    }

}

// window.addEventListener("load", main);