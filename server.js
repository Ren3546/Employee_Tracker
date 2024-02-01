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
          console.table(results);
          init();
        });
      }
      
function viewAllRoles() {
  db.query(
    `SELECT role.*, department.name AS department
    FROM role
    JOIN department ON role.department_id = department.id`,
    function (err, results) {
      if (err) {
        console.log(err);
        return;
      }
      console.log(results)

      const filteredResults = results.map(result => {
        const { department_id, ...rest } = result;
        return rest;
      });

      console.table(filteredResults);
      init();
    }
  );
}
      
      function viewAllEmployees() {
        db.query(
          `SELECT employee.*, 
          CASE 
            WHEN employee.manager_id IS NULL THEN 'None'
            ELSE CONCAT(manager.first_name, ' ', manager.last_name)
          END AS manager,
          role.title AS job_title,
          department.name AS department,
          role.salary
          FROM employee
          LEFT JOIN employee AS manager ON employee.manager_id = manager.id
          JOIN role ON employee.role_id = role.id
          JOIN department ON role.department_id = department.id`,
          function (err, results) {
            if (err) {
              console.log(err);
            }
            // Remove the role_id and manager_id columns from the results
            const filteredResults = results.map(result => {
              const { role_id, manager_id, ...rest } = result;
              return rest;
            });
      
            console.table(filteredResults);
            init();
          }
        );
      }
    
      function addDepartment() {
        inquirer.prompt({
            type: 'input',
            name:'name',
            message:'What would you like to name this new department?'
        })
        .then((option) => {
          const name = option.name;
          console.log(name)
          db.query('INSERT INTO department SET ?', { name: name }, (err, results) => {
            if (err) {
              console.log(err);
            }
            console.table(results);
            init();
          
        });
      })
    }

    //TODO: make it so that the choices are the departments and make the code convert that into its id
   function addRole() {
  const departments = `SELECT id, name FROM department`;

  db.query(departments, (error, departmentResults) => {
    if (error) {
      console.error(error);
      return;
    }

    inquirer.prompt([
      {
        type: 'input',
        name: 'role',
        message: 'What would you like to name this new role?'
      },
      {
        type: 'input',
        name: 'salary',
        message: 'What is the salary for this role?'
      },
      {
        type: 'list',
        name: 'departmentId',
        message: 'What department is this role?',
        choices: departmentResults.map((department) => ({ name: department.name, value: department.id }))
      }
    ])
    .then((option) => {
      const role = option.role;
      const salary = option.salary;
      const department = option.departmentId;
      console.log(role)
      db.query('INSERT INTO role SET ?', { title: role, salary:salary, department_id:department }, (err, results) => {
        if (err) {
          console.log(err);
        }
        console.table(results);
        init();
      });
    });
  });
}
      
function addEmployee() {
  // Query to retrieve the list of available managers
  const managers = `SELECT CONCAT(first_name, ' ', last_name) AS manager_name, id FROM employee`;

  // Query to retrieve the list of role titles and their corresponding role_ids
  const roles = `SELECT title, id AS role_id FROM role`;

  // Execute the queries
  db.query(managers, (error, managerResults) => {
    if (error) {
      console.error(error);
      return;
    }

    db.query(roles, (error, roleResults) => {
      if (error) {
        console.error(error);
        return;
      }

      // Create the choices arrays
      const roleChoices = roleResults.map(row => row.title);
      const managerChoices = [
        { name: "None", value: null },
        ...managerResults.map(({ manager_name, id }) => ({
          name: manager_name,
          value: id,
        })),
      ];

      inquirer
        .prompt([
          {
            type: 'input',
            name: 'first',
            message: "What is the employee's first name?"
          },
          {
            type: 'input',
            name: 'last',
            message: "What is the employee's last name?"
          },
          {
            type: 'list',
            name: 'role',
            message: "What is the employee's role?",
            choices: roleChoices
          },
          {
            type: 'list',
            name: 'manager',
            message: "Who is the employee's manager?",
            choices: managerChoices
          }
        ])
        .then(option => {
          const first = option.first;
          const last = option.last;
          const roleTitle = option.role;
          const manager = option.manager;

          // Find the corresponding role_id for the selected role title
          const selectedRole = roleResults.find(row => row.title === roleTitle);
          const role = selectedRole ? selectedRole.role_id : null;

          db.query(
            'INSERT INTO employee SET ?',
            { first_name: first, last_name: last, role_id: roleTitle, manager_id: manager },
            (err, results) => {
              if (err) {
                console.error(err);
                return;
              }

              console.table(results);
              init();
            }
          );
        });
    });
  });
}

function updateEmployeeRole() {
  const employeeList = `SELECT CONCAT(first_name, ' ', last_name) AS employee_name, id FROM employee`;
  const roles = `SELECT title, id AS role_id FROM role`;

  db.query(employeeList, (error, employeeResults) => {
    if (error) {
      console.error(error);
      return;
    }

    db.query(roles, (error, roleResults) => {
      if (error) {
        console.error(error);
        return;
      }

      const employeeChoices = employeeResults.map(({ employee_name, id }) => ({
        name: employee_name,
        value: id,
      }));

      const roleChoices = roleResults.map(({ title, role_id }) => ({
        name: title,
        value: role_id,
      }));

      inquirer
        .prompt([
          {
            type: 'list',
            name: 'employeeId',
            message: 'Select the employee to update:',
            choices: employeeChoices,
          },
          {
            type: 'list',
            name: 'roleId',
            message: 'Select the new role for the employee:',
            choices: roleChoices,
          },
        ])
        .then((option) => {
          const employeeId = option.employeeId;
          const roleId = option.roleId;

          db.query(
            'UPDATE employee SET role_id = ? WHERE id = ?',
            [roleId, employeeId],
            (err, results) => {
              if (err) {
                console.error(err);
                return;
              }

              console.log('Employee role updated successfully');
              init();
            }
          );
        });
    });
  });
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