const Sequelize = require('sequelize')
const {STRING, ENUM} = Sequelize
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

const School = conn.define('schools', {
  name: {
    type: STRING,
    allowNull: false,
    unique: true
  }
})

const Degree = conn.define('degree', {
  level: {
    type: ENUM('Masters', 'Bachelors', 'PhD')
  }
})

Degree.belongsTo(User)
Degree.belongsTo(School)

Department.findWithManagers = ()=>{
  return Department.findAll({
    include: [{model: User, as: 'manager'}],
    order: [
      ['name']
    ]
  })
}

Department.prototype.isManaged = function (){
  return !!this.managerId
}

Department.beforeSave(department => {
  if(department.managerId ===""){
    department.managerId = null
  }
})

Department.belongsTo(User, {as: 'manager'})
User.hasMany(Department, {foreignKey: 'managerId'})// the same as previous row, but the other way

const syncAndSeed = async()=>{
  await conn.sync({force: true})
  const [lucy, moe, larry] = await Promise.all(
    ['lucy', 'moe', 'larry'].map(name => User.create({ name }))
  )
  // console.log(lucy.get())
  const [hr, engeneering, marketing] = await Promise.all(
    ['hr', 'engeneering', 'marketing'].map(name => Department.create({ name }))
  )
  engeneering.managerId = lucy.id;
  marketing.managerId = lucy.id;
  await Promise.all([engeneering.save(), marketing.save()])

  const [mit, caltech, lsu] = await Promise.all(
    ['MIT', 'CalTech', 'LSU'].map(name => School.create({name}))
  )
  
  await Promise.all([
    Degree.create({ userId: moe.id, schoolId: mit.id, level: 'Bachelors'}),
    Degree.create({ userId: lucy.id, schoolId: caltech.id, level: 'PhD'}),
    Degree.create({ userId: lucy.id, schoolId: mit.id, level: 'Masters'}),
    Degree.create({ userId: moe.id, schoolId: lsu.id}),
  
  ])
}


module.exports ={
  syncAndSeed,
  models: {
    User, 
    Department, 
    School, 
    Degree
  }
}