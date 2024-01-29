const express = require('express');
// Import and require mysql2
const mysql = require('mysql2');
const inquirer = require('inquirer');

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// // Connect to database
const db = mysql.createConnection(
  {
    host: 'localhost',
    // MySQL username,
    user: 'root',
    // MySQL password
    password: 'password',
    database: 'company_db'
  },
  console.log(`Connected to the company_db database.`)
);

const questions = [
        {
            type: 'list',
            name: 'choice',
            message: "What would you like to do?",
            choices:[
            `view all departments`, 
            `view all roles`,
            `view all employees`, 
            `add a department`, 
            `add a role`, 
            `add an employee`, 
            `update an employee role`,
            ]
        }
    ];

    function init() {
        inquirer.prompt(questions).then((option) => {
          const choice = option.choice;
      
          switch (choice) {
            case 'view all departments':
              viewAllDepts();
              break;
            case 'view all roles':
              viewAllRoles();
              break;
            case 'view all employees':
              viewAllEmployees();
              break;
            case 'add a department':
              addDepartment();
              break;
            case 'add a role':
              addRole();
              break;
            case 'add an employee':
              addEmployee();
              break;
            case 'update an employee role':
              updateEmployeeRole();
              break;
            default:
              console.log('Invalid choice');
          }
        });
      }
      
      function viewAllDepts() {
        db.query('SELECT * FROM department', function (err, results) {
          if (err) {
            console.log(err);
          }
          console.log(results);
        });
      }
      
      function viewAllRoles() {
        console.log('Perform action for viewing all roles');
      }
      
      function viewAllEmployees() {
        console.log('Perform action for viewing all employees');
      }
      
      function addDepartment() {
        console.log('Perform action for adding a department');
      }
      
      function addRole() {
        console.log('Perform action for adding a role');
      }
      
      function addEmployee() {
        console.log('Perform action for adding an employee');
      }
      
      function updateEmployeeRole() {
        console.log('Perform action for updating an employee role');
      }
      
// Hardcoded query: DELETE FROM course_names WHERE id = 3;

// db.query(`DELETE FROM course_names WHERE id = ?`, 3, (err, result) => {
//   if (err) {
//     console.log(err);
//   }
//   console.log(result);
// });

// // Query database
// db.query('SELECT * FROM course_names', function (err, results) {
//   console.log(results);
// });

// Default response for any other request (Not Found)

init();