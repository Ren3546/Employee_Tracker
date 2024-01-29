INSERT INTO department (name)
VALUES ('Office'),
       ('Cash Register'),
       ('Kitchen');

INSERT INTO role (title, salary, department_id)
VALUES ('Management', 1000000, 1),
       ('Cashier', 50000, 2),
       ('Chef', 10, 3);
    
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Eugene', 'Krabs', 001, null),
       ('Squidward', 'Tentacles', 2, 1),
       ('Spongebob', 'Squarepants', 3, 1);
