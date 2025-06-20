import {BrowserRouter, Routes, Route} from 'react-router-dom'

import Tasks from './components/Tasks'
import Add from './components/Add'
import Update from './components/Update'



function App(){
  return (
    <BrowserRouter>
     <Routes>
       <Route path='/' element={<Tasks/>}/>
       <Route path='/home' element={<Tasks />}/>
       <Route path ='/add' element={<Add />}/>
       <Route path='/edit/:id' element={<Update />}/>
      
       <Route />
     </Routes>
    </BrowserRouter>

  )
}

export default App
