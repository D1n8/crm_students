(() => {
  const currentDate = new Date()
  let studentsArray = []

  function calculateAge(birthday){
      const birthdayObj = new Date(birthday)
      let age = currentDate.getFullYear() - birthdayObj.getFullYear()
      const monthDifference = currentDate.getMonth() - birthdayObj.getMonth()
      if (monthDifference < 0 || (monthDifference === 0 && currentDate.getDate() < birthdayObj.getDate())) {
          age--;
      }
      return age
  }

  function calculateStudyYears(studyStartYear){
      const endYear = studyStartYear + 4
      const studyYears = `${studyStartYear}-${endYear}`
      let course = `${currentDate.getFullYear() - studyStartYear} курс`

      if ((currentDate.getFullYear() > endYear) || ((currentDate.getFullYear() === endYear) && currentDate.getMonth() > 9)){
          course = 'закончил'
      }
      return `${studyYears} (${course})`
  }

  function testError(prop, name, errorContainer) {
      if (prop.value.trim() === ''){
          let error = document.createElement('p')
          error.textContent = `Укажите ${name}`
          errorContainer.append(error)
      }
  }

  function validationForm(surname, name, lastname, birthday, studyStart, faculty){
      const errorContainer = document.querySelector('.error-container')
      const studentbirthday = new Date(birthday.value)
      errorContainer.innerHTML = ''

      testError(surname, 'фамилию', errorContainer)
      testError(name, 'имя', errorContainer)
      testError(lastname, 'отчество', errorContainer)
      testError(faculty, 'факультет', errorContainer)

      if (studentbirthday.getFullYear() < 1900 || studentbirthday > currentDate || isNaN(studentbirthday)){
          let error = document.createElement('p')
          error.textContent = 'Укажите корректно дату рождения'
          errorContainer.append(error)
      }

      if (!Number.isInteger(Number(studyStart.value)) || Number(studyStart.value) < 2000 || Number(studyStart.value) > currentDate.getFullYear()){
          let error = document.createElement('p')
          error.textContent = 'Укажите год в диапозоне от 2000 года до текущуго года'
          errorContainer.append(error)
      }
      return errorContainer.childElementCount === 0
  }

  function filter(arr, prop, value){
      let result = []
      for (const item of arr) {
          if (String(item[prop]).includes(value))
              result.push(item)
      }
      return result
  }

  function createFilters(studentsList){
      let filterButton = document.getElementById('filter-btn')
      let inputFullname = document.getElementById('filter_fullname')
      let inputFaculty = document.getElementById('filter_faculty')
      let inputStudyStart = document.getElementById("filter_year_start")
      let inputEndStudy = document.getElementById("filter_year_end")
      let filteredArr

      filterButton.addEventListener('click', function() {
          filteredArr = Array.from(studentsArray)
          if (inputFullname.value !== ''){
              filteredArr = filter(studentsArray, 'surname', inputFullname.value)
                  .concat(filter(studentsArray, 'name', inputFullname.value))
                  .concat(filter(studentsArray, 'lastname', inputFullname.value))

              filteredArr = [...new Set(filteredArr)];
          }

          if (inputFaculty.value !== ''){
              filteredArr = filter(filteredArr, 'faculty', inputFaculty.value)
          }

          if (inputStudyStart.value !== ''){
              filteredArr = filter(filteredArr, 'studyStart', inputStudyStart.value)
          }

          if (inputEndStudy.value !== ''){
              filteredArr = filter(filteredArr, 'studyStart', String(Number(inputEndStudy.value) - 4))
          }

          clearListStudents(studentsList)

          if (inputFullname.value !== '' || inputFaculty.value !== '' || inputStudyStart.value !== '' || inputEndStudy.value !== ''){
              printStudents(filteredArr)
          } else {
              printStudents(studentsArray)
          }

          filteredArr = Array.from(studentsArray)
      })
  }

  function sortStudents(arr, prop, dir = false){
      let res = arr.sort(function(a,b){
          if (!dir ? a[prop] < b[prop] : a[prop] > b[prop]) return -1
      })
      return res
  }

  function addSorter(list, col, prop, isFirstClick){
      col.addEventListener('click', function() {
          let sortedArr = isFirstClick ? sortStudents(studentsArray, prop) : sortStudents(studentsArray, prop, true)
          clearListStudents(list)
          printStudents(sortedArr)
          isFirstClick = !isFirstClick
      })
  }

  function createSorters(studentsList){
      let fullname = document.getElementById('titles_fullname')
      let faculty = document.getElementById('titles_faculty')
      let birthday = document.getElementById('titles_birth_date')
      let studyYears = document.getElementById('titles_years_study')

      addSorter(studentsList, fullname, 'surname', isFirstClick = true)
      addSorter(studentsList, faculty, 'faculty', isFirstClick = true)
      addSorter(studentsList, birthday, 'birthday', isFirstClick = false)
      addSorter(studentsList, studyYears, 'studyStart', isFirstClick = true)
  }

  function createStudentsList() {
      let list = document.createElement('ul')
      list.setAttribute('id', 'students-list')
      list.classList.add('students-list')
      return list
  }

  function createStudent(obj){
      let box = document.createElement('div')
      let studentFullname = document.createElement('p')
      let studentFaculty = document.createElement('p')
      let studentbirthday = document.createElement('p')
      let studentStudyYears = document.createElement('p')
      let studentsList = document.getElementById('students-list')
      let btnDelete = document.createElement('button')
      let objBirthday = new Date(obj.birthday)

      studentFullname.textContent = `${obj.surname} ${obj.name} ${obj.lastname}`
      studentFaculty.textContent = obj.faculty
      studentbirthday.textContent = `${String(objBirthday.getDate())}.${String(objBirthday.getMonth() + 1)}.${String(objBirthday.getFullYear())} (${calculateAge(objBirthday)} лет)`
      studentStudyYears.textContent = calculateStudyYears(Number(obj.studyStart))
      btnDelete.textContent = 'Удалить'
      box.classList.add('student')
      studentFullname.classList.add('student-info')
      studentFaculty.classList.add('student-info')
      studentbirthday.classList.add('student-info')
      studentStudyYears.classList.add('student-info')
      btnDelete.classList.add('btn-delete')
      studentFullname.setAttribute('id', 'student-fullname')
      studentFaculty.setAttribute('id', 'student-faculty')
      studentStudyYears.setAttribute('id', 'student-study-years')

      btnDelete.addEventListener('click', async function() {
        await fetch(`http://localhost:3000/api/students/${obj.id}`, {
            method: 'DELETE',
        })
        clearListStudents(studentsList)
        loadStudentsArray()
      })

      box.append(studentFullname)
      box.append(studentFaculty)
      box.append(studentbirthday)
      box.append(studentStudyYears)
      box.append(btnDelete)

      return box
  }

  function clearListStudents(studentsList){
      while (studentsList.firstChild){
          studentsList.removeChild(studentsList.firstChild)
      }
  }

  function printStudents(studentsArr){
      let studentsList = document.getElementById('students-list')
      for (const student of studentsArr) {
          const newStudent = createStudent(student)
          studentsList.append(newStudent)
      }
  }

  async function loadStudentsArray(){
    const response = await fetch('http://localhost:3000/api/students')
    studentsArray = await response.json()
    printStudents(studentsArray)
  }

  function startControlSistem(){
      let studentsList = createStudentsList()
      let container = document.getElementById('main-container')
      let form = document.getElementById('form')
      let surname = document.getElementById('surname')
      let name = document.getElementById('name')
      let lastname = document.getElementById('lastname')
      let birthdayObj = document.getElementById('birthday')
      let faculty = document.getElementById('faculty')
      let studyStart = document.getElementById('studyStart')

      loadStudentsArray()

      form.addEventListener('submit', async function(e) {
          e.preventDefault()

          if (validationForm(surname, name, lastname, birthdayObj, studyStart, faculty)){
              const response = await fetch('http://localhost:3000/api/students', {
                method: 'POST',
                body: JSON.stringify({
                    name: name.value.trim(),
                    surname: surname.value.trim(),
                    lastname: lastname.value.trim(),
                    birthday: new Date(birthdayObj.value),
                    studyStart: studyStart.value.trim(),
                    faculty: faculty.value.trim()
                }),
                headers: { 'Content-Type': 'application/json'},
              })

              const objStudentElement = await response.json()

              studentsArray.push(objStudentElement)

              clearListStudents(studentsList)
              loadStudentsArray()

              surname.value = ''
              name.value = ''
              lastname.value = ''
              birthdayObj.value = ''
              faculty.value = ''
              studyStart.value = ''
            }
      })

      createSorters(studentsList)
      createFilters(studentsList)

      container.append(studentsList)
  }

  window.startControlSistem = startControlSistem
})()


