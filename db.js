const Sequelize = require('sequelize')
const {STRING} = Sequelize
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_departments_db')

const User = conn.define('user', {
  name: {
    type: STRING,
    allowNull: false,
    unique: true
  }
})

const Department = conn.define('department', {
  name: {
    type: STRING,
    allowNull: false,
    unique: true
  }
})

Department.belongsTo(User)
// User.hasMany(Department) the same as previous row

const syncAndSeed = async()=>{
  await conn.sync({force: true})
  const [lucy, moe, larry] = await Promise.all(
    ['lucy', 'moe', 'larry'].map(name => User.create({ name }))
  )
  // console.log(lucy.get())
  const [hr, engeneering, marketing] = await Promise.all(
    ['hr', 'engeneering', 'marketing'].map(name => Department.create({ name }))
  )
  engeneering.userId = lucy.id;
  marketing.userId = lucy.id;
  await Promise.all([engeneering.save(), marketing.save()])

}

module.exports ={
  syncAndSeed,
  models: {
    User, 
    Department
  }
}