import React from 'react'

function BackgroundMusic() {
  const handleclick = ()=>
  {
    alert("button clicked")
  }
  return (
   <>
   <button className='dark' onClick={handleclick}></button>
   </>
  )
}

export default BackgroundMusic
