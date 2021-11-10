const {syncAndSeed, models: { User, Department, School, Degree}} = require('./db')
const express =  require('express')
const app = express()

app.use(require('method-override')('_method'));
app.use(express.urlencoded({extended: false}))

app.put ('/department/:id', async(req, res, next)=>{
  try{
    const department = await Department.findByPk(req.params.id)
    await department.update(req.body)
    res.redirect('/')
  }
  catch(ex){
    next(ex)
  }
})


app.get('/', async(req, res, next)=>{
  try{
    const [users, departments, degrees] = await Promise.all([
      User.findAll({
        include: [Department]
      }),
      Department.findWithManagers(),
      Degree.findAll({
        include: [School, User]
      })
    ])
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>Acme Corp Managment</title>
      </head>
      <body>
      <div>
        <h2>Deparments</h2>
        <ul>
        ${departments.map(department =>`
          <li>
          ${department.name}
          ${department.isManaged()}
          <form method ='POST' action='/department/${department.id}?_method=PUT'>
          <select name ='managerId'>
          <option value="" >-- not managed --</option>
          ${
            users.map (user =>`
            <option value='${user.id}'${ user.id ===department.managerId ? 'selected = "selected"': ''}>${user.name}</option>
            `).join('')
          }
          </select>
          <button>Save</button>
          </form>

          </li>
        `).join('')}
        </ul>
      </div>
      <div>
      <h2>Users</h2>
      <ul>
        ${users.map(user =>`
          <li>
          ${user.name}
          <ul>
          ${ user.departments.map (department => `
          <li>
          ${department.name}
          </li>
          
          `).join('')}
          </ul>
          </li>
        `).join('')}
        </ul>
      </div>
      <div>
      <h2>Degrees</h2>
      <ul>
        ${degrees.map(degree =>`
          <li>
          ${degree.user.name} attanded ${degree.school.name} (${degree.level || 'no degree'})
          </li>
          `).join('')
        }
          </ul>
      </div>
      </body>
      </html>
      `
    )
  }
  catch(ex){
    next(ex)
  }
})

const init = async()=>{
  try{
    await syncAndSeed()
    const port =process.env.PORT || 3000
    app.listen(port, ()=> console.log(`listening on port ${port}`))
  }
  catch(ex){
    console.log(ex)
  }
}
init()