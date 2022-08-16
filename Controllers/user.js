const mysql = require('mysql');

let pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kullaniciyonetimi',
});

exports.getAll = async (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err
        connection.query('SELECT * FROM users', (err, users) => {
            if (err) throw err;

            let datas = [];
            let leaders = {};
            users.forEach((row) =>
                connection.query('SELECT * FROM userleaders WHERE userId = ?', [row.id], (err, ldrs) => {
                    if (err) throw err
                    leaders = {};
                    ldrs.forEach((ld) => {
                        const person = users.find((rw) => rw.id === ld.leaderId);
                        leaders.leaders ? leaders.leaders.push(person.firstName + ' ' + person.lastName) : leaders = { ...row, 'leaders': [person.firstName + ' ' + person.lastName] }
                        if (!datas.find((data) => data.id === row.id)) {
                            datas.push(leaders);
                        }
                    })
                    if (users.length === row.id) {
                        for (var user of users) {
                            if (!datas.find((data) => data.id === user.id)) {
                                datas.push(user)
                            }
                        }
                        setTimeout(() => {
                            res.send(datas)
                        }, 500);
                    }
                })
            )

            connection.release();
        })
    })
}

exports.updateLeaders = async (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err
            connection.query('DELETE FROM userleaders WHERE userId = ?', [req.body.userId], (err,rows) => {
                if(err) throw err
            });
        const { leaders, userId } = req.body;
        let leaderIds = [];
        try {
            leaders.forEach((leader) => {
                connection.query('SELECT * FROM users WHERE firstName = ?', [leader.name.split(' ')[0]], (err, rows) => {
                    if (err) throw err
                    else {
                        leaderIds.push(rows[0].id);
                    }
                })
            })
        } catch (err) {
            throw err
        }
        setTimeout(() => {
            try {
                leaderIds.forEach((lead) => {
                    let params = {
                        "userId": userId,
                        "leaderId": lead
                    }
                    connection.query('INSERT INTO userleaders SET ?', [params], (err, rows) => {
                        if (err) throw err
                        else {
                            !res.headersSent && res.send("success")
                        }
                    })
                })
            } catch (err) {
                throw err
            }
        }, 500);
        connection.release() //
    })
}

exports.newUser = async (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err

        const { firstName, lastName, email, role, leaders } = req.body;

        const params = {
            "firstName": firstName,
            "lastName": lastName,
            "email": email,
            "role": role
        }
        connection.query('INSERT INTO users SET ?', [params], (err, user) => {

            if (!err) {
                let leaderIds = [];
                try {
                    leaders && leaders.forEach((leader) => {
                        connection.query('SELECT * FROM users WHERE firstName = ?', [leader.name.split(' ')[0]], (err, rows) => {
                            if (err) res.send(err)
                            else {
                                leaderIds.push(rows[0].id);
                            }
                        })
                    })
                } catch (err) {
                    throw err
                }
                setTimeout(() => {
                    try {
                        leaderIds.forEach((lead) => {
                            let params = {
                                "userId": user.insertId,
                                "leaderId": lead
                            }
                            connection.query('INSERT INTO userleaders SET ?', [params], (err, rows) => {
                                if (err) res.send(err)
                                else {
                                    !res.headersSent && res.send("success")
                                }
                            })
                        })
                    } catch (err) {
                        throw err
                    }
                }, 500);

            } else {
                throw err
            }
            connection.release() //
        })
    })
}

exports.signin = async (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err
        connection.query('SELECT * FROM users WHERE email = ?', [req.body.email], (err, user) => {
            if (err) throw err;
            if (user.length > 0) {
                !res.headersSent && res.status(200).json({ user });
            } else {
                !res.headersSent && res.status(401).json("Hatalı giriş.")
            }
        })
        connection.release();
    })
}