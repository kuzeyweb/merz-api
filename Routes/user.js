const {  signin, getAll, newUser, updateLeaders} = require("../Controllers/user");

const router = require("express").Router();


router.get("/getall", getAll )

router.post("/new", newUser )

router.post('/update', updateLeaders)
  
router.post("/signin", signin )


module.exports = router; 