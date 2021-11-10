const {syncAndSeed} = require('./db')

const init = async()=>{
  try{
    await syncAndSeed()
  }
  catch(ex){
    console.log(ex)
  }
}
init()